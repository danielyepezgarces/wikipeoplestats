import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/session-manager'
import { Database } from '@/lib/database'

export const runtime = 'nodejs' // Add this to your route file

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
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 401, headers: response.headers })
    }

    const session = await SessionManager.validateSession(sessionToken)

    if (!session) {
      return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401, headers: response.headers })
    }

    // Obtener información completa de roles y chapters del usuario
    const conn = await Database.getConnection()
    
    try {
      // Obtener todos los roles del usuario con información de chapters
      const [roleRows] = await conn.execute(`
        SELECT 
          r.name as role_name,
          c.id as chapter_id,
          c.name as chapter_name,
          c.slug as chapter_slug
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        LEFT JOIN chapters c ON ur.chapter_id = c.id
        WHERE ur.user_id = ? AND r.is_active = 1
        ORDER BY 
          CASE r.name 
            WHEN 'super_admin' THEN 1
            WHEN 'chapter_admin' THEN 2
            WHEN 'community_admin' THEN 3
            WHEN 'chapter_moderator' THEN 4
            WHEN 'community_moderator' THEN 5
            ELSE 6
          END
      `, [session.user_id])
      
      const userRoles = roleRows as any[]
      const roles = userRoles.map(r => r.role_name)
      const primaryRole = roles[0] || 'user'
      
      // Agrupar chapters por usuario
      const chapters = userRoles
        .filter(r => r.chapter_id)
        .map(r => ({
          id: r.chapter_id,
          name: r.chapter_name,
          slug: r.chapter_slug,
          role: r.role_name
        }))
        .filter((chapter, index, self) => 
          index === self.findIndex(c => c.id === chapter.id)
        )

    console.log('🔍 User verification result:', {
      userId: session.user_id,
      username: session.username,
      roles: roles,
      chapters: chapters,
      primaryRole: primaryRole
    })
    return NextResponse.json({
      user: {
        id: session.user_id,
        name: session.username,
        email: session.email,
        role: primaryRole,
        roles: roles,
        chapters: chapters,
        wikipediaUsername: session.username,
        avatarUrl: session.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.username)}&background=random&rounded=true`
      }
    }, { headers: response.headers })
    
    } finally {
      conn.release()
    }
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
