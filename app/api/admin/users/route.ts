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

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = (page - 1) * limit

    // Consulta total de usuarios
    const [[{ total }]] = await conn.query(`SELECT COUNT(*) as total FROM users`)

    // Consulta paginada con capítulo y roles
    const [rows] = await conn.query(
      `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.created_at,
        c.name AS chapter,
        GROUP_CONCAT(r.name) AS roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      LEFT JOIN chapters c ON c.id = ur.chapter_id
      GROUP BY u.id
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset]
    )

    const users = rows.map((row: any) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      chapter: row.chapter || null,
      roles: row.roles ? row.roles.split(',') : [],
      created_at: row.created_at || null,
    }))

    return NextResponse.json({ users, total })
  } catch (error) {
    console.error('Error en /api/users:', error)
    return NextResponse.json({ error: 'Error interno', message: error.message }, { status: 500 })
  }
}
