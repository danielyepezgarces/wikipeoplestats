import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'wikipeoplestats',
})

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  const response = new NextResponse()

  const isDev = process.env.NODE_ENV === 'development'
  const isLocal = origin?.includes('localhost') || origin?.includes('127.0.0.1')
  const isAllowed = origin?.includes('wikipeoplestats.org')

  if ((isDev && isLocal) || isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin!)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401, headers: response.headers })
    }

    let payload: any
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (err) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401, headers: response.headers })
    }

    const userId = payload.userId
    const [userRows] = await db.query(
      'SELECT id, username, email, last_login FROM users WHERE id = ? LIMIT 1',
      [userId]
    )
    const user = (userRows as any)[0]
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401, headers: response.headers })
    }

    const [roleRows] = await db.query(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [userId]
    )
    const roles = (roleRows as any[]).map(r => r.name)
    const role = roles[0] || 'user'

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role,
        roles,
        wikipediaUsername: user.username,
        lastLogin: user.last_login,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&rounded=true`
      }
    }, { headers: response.headers })
  } catch (e) {
    console.error('Error interno:', e)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: response.headers })
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const response = new NextResponse(null, { status: 200 })

  const isDev = process.env.NODE_ENV === 'development'
  const isLocal = origin?.includes('localhost') || origin?.includes('127.0.0.1')
  const isAllowed = origin?.includes('wikipeoplestats.org')

  if ((isDev && isLocal) || isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin!)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}
