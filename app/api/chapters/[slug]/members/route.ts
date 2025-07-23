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
        cm.joined_at, -- Include joined_at from chapter_membership
        u.created_at
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      LEFT JOIN chapter_membership cm ON cm.user_id = u.id AND cm.chapter_id = ur.chapter_id
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
    const { username, wikimedia_id, role_id, joined_at } = body // joined_at is here, banner_credits is not

    if (!username || !wikimedia_id || !role_id) {
      return NextResponse.json({ error: "Missing username, wikimedia_id or role_id" }, { status: 400 })
    }

    const conn = await getConnection()

    // Verificar si el usuario ya existe en la base de datos local por wikimedia_id o username
    const [existingUsers] = await conn.query("SELECT id FROM users WHERE wikimedia_id = ? OR username = ?", [
      wikimedia_id,
      username,
    ])

    let userId: number
    let userCreated = false

    if ((existingUsers as any[]).length === 0) {
      // El usuario no existe, crearlo
      const [insertResult] = await conn.query(
        `
        INSERT INTO users (username, wikimedia_id, created_at, updated_at, is_active)
        VALUES (?, ?, NOW(), NOW(), 1)
        `,
        [username, wikimedia_id],
      )
      userId = (insertResult as any).insertId
      userCreated = true
    } else {
      userId = (existingUsers as any[])[0].id

      // Update existing user with latest data
      await conn.query(
        `
        UPDATE users 
        SET username = ?, wikimedia_id = ?, updated_at = NOW()
        WHERE id = ?
        `,
        [username, wikimedia_id, userId],
      )
    }

    // Insert or update into chapter_membership
    // Use INSERT ... ON DUPLICATE KEY UPDATE if you want to update joined_at if membership exists
    // For simplicity, we'll check and insert/update separately
    const [existingMembership] = await conn.query(
      "SELECT user_id FROM chapter_membership WHERE user_id = ? AND chapter_id = ?",
      [userId, chapterId],
    )

    if ((existingMembership as any[]).length > 0) {
      // If already a member, update joined_at if provided
      if (joined_at) {
        await conn.query(`UPDATE chapter_membership SET joined_at = ? WHERE user_id = ? AND chapter_id = ?`, [
          joined_at,
          userId,
          chapterId,
        ])
      }
    } else {
      // Insert into chapter_membership if not already a member
      await conn.query(
        `
        INSERT INTO chapter_membership (user_id, chapter_id, joined_at)
        VALUES (?, ?, ?)
        `,
        [userId, chapterId, joined_at || null], // Pass joined_at or null, DB will use NOW() if null
      )
    }

    // Check if user already has this role in this chapter (in user_roles)
    const [existingUserRole] = await conn.query(
      "SELECT user_id FROM user_roles WHERE user_id = ? AND chapter_id = ? AND role_id = ?",
      [userId, chapterId, role_id],
    )

    if ((existingUserRole as any[]).length > 0) {
      // If role already exists, just return success, no need to re-insert
      return NextResponse.json({
        success: true,
        created: userCreated,
        message: userCreated
          ? "User created and role already assigned in chapter"
          : "User role already assigned in chapter",
        user_data: {
          id: userId,
          username: username,
          wikimedia_id: wikimedia_id,
        },
      })
    } else {
      // Insert into user_roles
      await conn.query(
        `
        INSERT INTO user_roles (user_id, role_id, chapter_id)
        VALUES (?, ?, ?)
        `,
        [userId, role_id, chapterId],
      )
    }

    return NextResponse.json({
      success: true,
      created: userCreated,
      message: userCreated ? "User created and added to chapter" : "User added to chapter",
      user_data: {
        id: userId,
        username: username,
        wikimedia_id: wikimedia_id,
      },
    })
  } catch (error: any) {
    console.error("Error adding member:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
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

    return NextResponse.json({ success: true, message: "Member removed successfully" })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}
