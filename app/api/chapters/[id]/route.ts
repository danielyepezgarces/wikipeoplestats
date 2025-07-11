import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/database'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const chapterId = parseInt(params.id)

  if (!user || (!user.roles.includes('super_admin') && !user.chapter_admin_ids?.includes(chapterId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { name, slug, status, avatar_url, banner_url } = await req.json()
  const conn = await getConnection()

  await conn.query(
    `UPDATE chapters SET name = ?, slug = ?, status = ?, avatar_url = ?, banner_url = ? WHERE id = ?`,
    [name, slug, status, avatar_url || null, banner_url || null, chapterId]
  )

  return NextResponse.json({ success: true })
}
