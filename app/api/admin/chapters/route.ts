import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/database'
import { getAllChaptersWithStats } from '@/lib/queries/chapters'
import { requireRole } from '@/lib/auth-middleware-new'

// === GET: Obtener capítulos con stats ===
export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['super_admin', 'chapter_admin'])

    const chapters = await getAllChaptersWithStats()
    return NextResponse.json(chapters)
  } catch (error) {
    console.error('Error en GET /api/admin/chapters:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { 
      status: error instanceof Error && error.message.includes('permissions') ? 403 : 500 
    })
  }
}

// === POST: Crear capítulo y asignar administrador ===
export async function POST(req: NextRequest) {
  const conn = await getConnection()

  try {
    const auth = await requireRole(req, 'super_admin')

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
      `INSERT INTO chapters (slug, name, avatar_url, banner_url, banner_credits, banner_license, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [slug, name, avatar_url || null, banner_url || null, banner_credits || null, finalBannerLicense || null]
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
    try {
      await conn.rollback()
    } catch (_) {
      // rollback puede fallar si no hubo beginTransaction
    }
    console.error('Error en POST /api/chapters:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { 
      status: error instanceof Error && error.message.includes('permissions') ? 403 : 500 
    })
  } finally {
    conn.release()
  }
}
