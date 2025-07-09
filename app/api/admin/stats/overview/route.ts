import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/database'

let rawDomain = process.env.AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
if (!rawDomain.startsWith('http')) {
  rawDomain = 'https://' + rawDomain
}
const authDomain = rawDomain

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || ''

    const verifyRes = await fetch(`${authDomain}/api/auth/verify`, {
      headers: { cookie: cookieHeader },
      credentials: 'include'
    })

    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { user } = await verifyRes.json()

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const conn = await getConnection()

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
    return NextResponse.json({ error: 'Error interno del servidor', message: error.message }, { status: 500 })
  }
}
