import { cookies as nextCookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getConnection } from '@/lib/database'
import { getAllChaptersWithStats } from '@/lib/queries/chapters'

// === GET: Obtener capítulos con stats ===
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const authDomain = process.env.AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'

    const verifyRes = await fetch(`${authDomain}/api/auth/verify`, {
      headers: { cookie: cookieHeader },
      credentials: 'include'
    })

    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { user } = await verifyRes.json()

    if (!user || !['super_admin', 'chapter_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const chapters = await getAllChaptersWithStats()
    return NextResponse.json(chapters)
  } catch (error) {
    console.error('Error al verificar sesión (GET):', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// === POST: Crear capítulo y asignar administrador ===
export async function POST(req: NextRequest) {
  try {
    const cookieStore = nextCookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const {
      name,
      slug,
      avatar_url,
      banner_url,
      banner_credits,
      banner_license,
      admin_username
    } = await req.json()

    if (!admin_username || !slug || !name) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const conn = await getConnection()
    await conn.beginTransaction()

    const [users] = await conn.execute(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [admin_username]
    )
    const user = (users as any[])[0]
    if (!user) {
      await conn.rollback()
      return NextResponse.json({ error: 'Usuario administrador no encontrado' }, { status: 404 })
    }

    const adminUserId = user.id

    const [chapterResult] = await conn.execute(
      `INSERT INTO chapters (slug, avatar_url, banner_url, banner_credits, banner_license, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [slug, avatar_url || null, banner_url || null, banner_credits || null, banner_license || 'CC-BY-SA-4.0']
    )
    const chapterId = (chapterResult as any).insertId

    await conn.execute(
      `INSERT INTO chapter_membership (user_id, chapter_id) VALUES (?, ?)`,
      [adminUserId, chapterId]
    )

    await conn.execute(
      `INSERT INTO user_roles (user_id, role_id, chapter_id) VALUES (?, 3, ?)`,
      [adminUserId, chapterId]
    )

    await conn.commit()

    return NextResponse.json({
      success: true,
      chapter_id: chapterId,
      assigned_admin: admin_username
    }, { status: 201 })
  } catch (error) {
    console.error('Error al crear capítulo (POST):', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
