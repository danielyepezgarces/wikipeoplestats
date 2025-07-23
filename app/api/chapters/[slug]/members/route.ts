import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/database"
import { getCurrentUser } from "@/lib/auth"
import { getChapterIdBySlug } from "@/lib/db/chapters"

// Obtener miembros del capítulo
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const chapterSlug = params.slug
  const chapterId = await getChapterIdBySlug(chapterSlug)

  if (!chapterId) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
  }

  const user = await getCurrentUser(req)
  if (!user || (user.role !== "super_admin" && user.role !== "chapter_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (user.role === "chapter_admin" && user.chapter_id !== chapterId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const conn = await getConnection()
    const [rows] = await conn.query(
      `
      SELECT 
        u.id,
        u.username,
        u.email,
        r.name AS role,
        u.created_at
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.chapter_id = ?
      ORDER BY u.created_at DESC
      `,
      [chapterId],
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching chapter members:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Añadir miembro al capítulo
// Añadir miembro al capítulo
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const chapterSlug = params.slug
  const chapterId = await getChapterIdBySlug(chapterSlug)

  if (!chapterId) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
  }

  const user = await getCurrentUser(req)

  if (!user || (user.role !== "super_admin" && user.role !== "chapter_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (user.role === "chapter_admin" && user.chapter_id !== chapterId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { username, wikimedia_id, role_id } = body

    if (!username || !wikimedia_id || !role_id) {
      return NextResponse.json({ error: "Missing username, wikimedia_id or role_id" }, { status: 400 })
    }

    const conn = await getConnection()

    // Verificar si el usuario ya existe en la base de datos local por wikimedia_id
    const [existingUsers] = await conn.query(
      "SELECT id FROM users WHERE wikimedia_id = ? OR username = ?", 
      [wikimedia_id, username]
    )

    let userId: number
    let userCreated = false

    if ((existingUsers as any[]).length === 0) {
      // El usuario no existe, crearlo
      const [insertResult] = await conn.query(
        `
        INSERT INTO users (username, wikimedia_id, created_at, updated_at, is_active)
        VALUES (?, ?, NOW(), NOW(), 1)
        `,
        [username, wikimedia_id], // Usar el wikimedia_id real
      )
      userId = (insertResult as any).insertId
      userCreated = true
    } else {
      userId = (existingUsers as any[])[0].id
      
      // Actualizar el usuario existente con los datos más recientes
      await conn.query(
        `
        UPDATE users 
        SET username = ?, wikimedia_id = ?, updated_at = NOW()
        WHERE id = ?
        `,
        [username, wikimedia_id, userId]
      )
    }

    // Verificar si el usuario ya es miembro del capítulo
    const [existingMembership] = await conn.query("SELECT id FROM user_roles WHERE user_id = ? AND chapter_id = ?", [
      userId,
      chapterId,
    ])

    if ((existingMembership as any[]).length > 0) {
      return NextResponse.json({ error: "User is already a member of this chapter" }, { status: 400 })
    }

    // Insertar en chapter_membership
    await conn.query(
      `
      INSERT IGNORE INTO chapter_membership (user_id, chapter_id, joined_at)
      VALUES (?, ?, NOW())
      `,
      [userId, chapterId],
    )

    // Insertar en user_roles
    await conn.query(
      `
      INSERT INTO user_roles (user_id, role_id, chapter_id, created_at)
      VALUES (?, ?, ?, NOW())
      `,
      [userId, role_id, chapterId],
    )

    return NextResponse.json({
      success: true,
      created: userCreated,
      message: userCreated ? "User created and added to chapter" : "User added to chapter",
      user_data: {
        id: userId,
        username: username,
        wikimedia_id: wikimedia_id
      }
    })
  } catch (error) {
    console.error("Error adding member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Eliminar miembro del capítulo
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const chapterSlug = params.slug
  const chapterId = await getChapterIdBySlug(chapterSlug)

  if (!chapterId) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
  }

  const user = await getCurrentUser(req)

  if (!user || (user.role !== "super_admin" && user.role !== "chapter_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (user.role === "chapter_admin" && user.chapter_id !== chapterId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const userId = Number.parseInt(searchParams.get("user_id") || "")
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Missing or invalid user_id" }, { status: 400 })
  }

  try {
    const conn = await getConnection()

    // Verificar que el usuario es miembro del capítulo
    const [membership] = await conn.query("SELECT id FROM user_roles WHERE user_id = ? AND chapter_id = ?", [
      userId,
      chapterId,
    ])

    if ((membership as any[]).length === 0) {
      return NextResponse.json({ error: "User is not a member of this chapter" }, { status: 404 })
    }

    // Eliminar de chapter_membership
    await conn.query(
      `
      DELETE FROM chapter_membership
      WHERE user_id = ? AND chapter_id = ?
      `,
      [userId, chapterId],
    )

    // Eliminar de user_roles
    await conn.query(
      `
      DELETE FROM user_roles
      WHERE user_id = ? AND chapter_id = ?
      `,
      [userId, chapterId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}
