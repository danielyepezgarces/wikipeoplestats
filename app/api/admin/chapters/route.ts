import { NextResponse } from 'next/server'
import { getAllChaptersWithStats } from '@/lib/queries/chapters'

// Verificamos sesión reenviando la cookie al auth service
export async function GET(req: Request) {
  try {
    const cookies = req.headers.get('cookie') || ''
    
    const authDomain = process.env.AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
    const verifyRes = await fetch(`${authDomain}/api/auth/verify`, {
      headers: {
        cookie: cookies
      },
      credentials: 'include'
    })

    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { user } = await verifyRes.json()

    // Aquí puedes restringir aún más por rol si quieres
    if (!user || !['super_admin', 'chapter_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const chapters = await getAllChaptersWithStats()
    return NextResponse.json(chapters)

  } catch (error) {
    console.error('Error al verificar sesión:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
