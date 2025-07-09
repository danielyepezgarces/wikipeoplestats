import { cookies as nextCookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getConnection } from '@/lib/database'
import { getAllChaptersWithStats } from '@/lib/queries/chapters'

let rawDomain = process.env.AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
if (!rawDomain.startsWith('http')) {
  rawDomain = 'https://' + rawDomain
}
const authDomain = rawDomain

// === GET: Obtener capítulos con stats ===
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
    const cookieHeader = req.headers.get('cookie') || ''

    const verifyRes = await fetch(`${authDomain}/api/auth/verify`, {
      headers: { cookie: cookieHeader },
      credentials: 'include',
    })

    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { user } = await verifyRes.json()

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const {
      name,
      slug,
      avatar_url,
      banner_url,
      banner_credits,
      banner_license,
      admin_username,
    } = await req.json()

    if (!admin_username || !slug || !name) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const finalBannerLicense = banner_url ? (banner_license || 'CC-BY-SA-4.0') : null

    const conn = await getConnection()
    await conn.beginTransaction()

    // Verificar que el slug no esté ya en uso
    const [existingSlugs] = await conn.execute(
      'SELECT id FROM chapters WHERE slug = ? LIMIT 1',
      [slug]
    )
    if ((existingSlugs as any[]).length > 0) {
      await conn.rollback()
      return NextResponse.json({ error: 'El slug ya está en uso' }, { status: 409 })
    }

    // Verificar si el usuario existe
    const [users] = await conn.execute(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [admin_username]
    )
    const userRow = (users as any[])[0]
    if (!userRow) {
      await conn.rollback()
      return NextResponse.json({ error: 'Usuario administrador no encontrado' }, { status: 404 })
    }

    const adminUserId = userRow.id

    // Crear capítulo
    const [chapterResult] = await conn.execute(
      `INSERT INTO chapters (slug, avatar_url, banner_url, banner_credits, banner_license, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [slug, avatar_url || null, banner_url || null, banner_credits || null, finalBannerLicense]
    )
    const chapterId = (chapterResult as any).insertId

    // Registrar membresía
    await conn.execute(
      `INSERT INTO chapter_membership (user_id, chapter_id) VALUES (?, ?)`,
      [adminUserId, chapterId]
    )

    // Asignar rol como chapter_admin (role_id = 3)
    await conn.execute(
      `INSERT INTO user_roles (user_id, role_id, chapter_id) VALUES (?, 3, ?)`,
      [adminUserId, chapterId]
    )

    await conn.commit()

    return NextResponse.json(
      {
        success: true,
        chapter_id: chapterId,
        assigned_admin: admin_username,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear capítulo (POST):', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}