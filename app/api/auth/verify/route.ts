import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/session-manager'

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

    const role = session.roles[0] || 'user'

    return NextResponse.json({
      user: {
        id: session.user_id,
        name: session.username,
        email: session.email,
        role,
        roles: session.roles,
        wikipediaUsername: session.username,
        avatarUrl: session.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.username)}&background=random&rounded=true`
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
