import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'
import { getChapterIdBySlug } from '@/lib/db/chapters'

// Obtener miembros del capítulo
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const chapterSlug = params.slug
  const chapterId = await getChapterIdBySlug(chapterSlug)
  
  if (!chapterId) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
  }

  const user = await getCurrentUser(req)
  if (!user || (user.role !== 'super_admin' && user.role !== 'chapter_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role === 'chapter_admin' && user.chapter_id !== chapterId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
      [chapterId]
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching chapter members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Añadir miembro al capítulo
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const chapterSlug = params.slug
  const chapterId = await getChapterIdBySlug(chapterSlug)
  
  if (!chapterId) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
  }

  const user = await getCurrentUser(req)

  if (!user || (user.role !== 'super_admin' && user.role !== 'chapter_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role === 'chapter_admin' && user.chapter_id !== chapterId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { user_id, role_id } = body

    if (!user_id || !role_id) {
      return NextResponse.json({ error: 'Missing user_id or role_id' }, { status: 400 })
    }

    const conn = await getConnection()

    // Insertar en chapter_membership
    await conn.query(
      `
      INSERT IGNORE INTO chapter_membership (user_id, chapter_id)
      VALUES (?, ?)
      `,
      [user_id, chapterId]
    )

    // Insertar o actualizar en user_roles
    await conn.query(
      `
      INSERT INTO user_roles (user_id, role_id, chapter_id)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
      `,
      [user_id, role_id, chapterId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Eliminar miembro del capítulo
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const chapterSlug = params.slug
  const chapterId = await getChapterIdBySlug(chapterSlug)
  
  if (!chapterId) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
  }

  const user = await getCurrentUser(req)

  if (!user || (user.role !== 'super_admin' && user.role !== 'chapter_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role === 'chapter_admin' && user.chapter_id !== chapterId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const userId = parseInt(searchParams.get('user_id') || '')
  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Missing or invalid user_id' }, { status: 400 })
  }

  try {
    const conn = await getConnection()

    await conn.query(
      `
      DELETE FROM chapter_membership
      WHERE user_id = ? AND chapter_id = ?
      `,
      [userId, chapterId]
    )

    await conn.query(
      `
      DELETE FROM user_roles
      WHERE user_id = ? AND chapter_id = ?
      `,
      [userId, chapterId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}