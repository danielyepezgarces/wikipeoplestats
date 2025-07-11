import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const chapterId = parseInt(params.id)

  if (isNaN(chapterId)) {
    return NextResponse.json({ error: 'Invalid chapter ID' }, { status: 400 })
  }

  const user = await getCurrentUser(req)

  if (!user || (user.role !== 'super_admin' && user.role !== 'chapter_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Si es chapter_admin, solo puede ver su propio capítulo
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
