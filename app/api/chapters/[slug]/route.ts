import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/database"
import { getCurrentUser } from "@/lib/auth"
import { getChapterIdBySlug } from "@/lib/db/chapters"

// Obtener detalles del capítulo
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const chapterSlug = params.slug
  const chapterId = await getChapterIdBySlug(chapterSlug)

  if (!chapterId) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
  }

  try {
    const conn = await getConnection()
    const [rows] = await conn.query(
      `
      SELECT 
        id, 
        name, 
        slug, 
        status, 
        avatar_url, 
        banner_url,
        banner_credits, -- Include banner_credits
        created_at, 
        updated_at
      FROM chapters
      WHERE id = ?
      `,
      [chapterId],
    )
    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json(rows[0])
    } else {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching chapter details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Actualizar capítulo
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
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
    const { name, slug, status, avatar_url, banner_url, banner_credits } = body // banner_credits included

    if (!name || !slug || !status) {
      return NextResponse.json({ error: "Missing name, slug or status" }, { status: 400 })
    }

    const conn = await getConnection()
    await conn.query(
      `
      UPDATE chapters
      SET 
        name = ?, 
        slug = ?, 
        status = ?, 
        avatar_url = ?, 
        banner_url = ?,
        banner_credits = ?, -- Update banner_credits
        updated_at = NOW()
      WHERE id = ?
      `,
      [name, slug, status, avatar_url, banner_url, banner_credits, chapterId],
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating chapter:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}

// Eliminar capítulo
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const chapterSlug = params.slug
  const chapterId = await getChapterIdBySlug(chapterSlug)

  if (!chapterId) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
  }

  const user = await getCurrentUser(req)
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const conn = await getConnection()
    await conn.query("DELETE FROM chapters WHERE id = ?", [chapterId])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting chapter:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
