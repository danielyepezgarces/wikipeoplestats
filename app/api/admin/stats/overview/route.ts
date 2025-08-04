import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/database'
import { requireRole } from '@/lib/auth-middleware-new'

export async function GET(req: NextRequest) {
  let conn
  try {
    const auth = await requireRole(req, 'super_admin')

    conn = await getConnection()

    const [stats] = await conn.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM chapters) AS chapters,
        (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role_id IN (
          SELECT id FROM roles WHERE name = 'chapter_admin'
        )) AS admins,
        (SELECT COUNT(DISTINCT site) FROM project) AS active_projects
    `)

    return NextResponse.json(stats[0])
  } catch (error) {
    console.error('Error en /api/stats/overview:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { 
      status: error instanceof Error && error.message.includes('permissions') ? 403 : 500 
    })
  } finally {
    if (conn) conn.release()
  }
}
