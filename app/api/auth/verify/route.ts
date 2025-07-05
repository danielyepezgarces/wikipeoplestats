import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  console.log('🔍 Verificando autenticación...')

  try {
    const origin = request.headers.get('origin')
    const response = new NextResponse()

    const isDevelopment = process.env.NODE_ENV === 'development'
    const isLocalhostOrigin = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))
    const isWikipeopleOrigin = origin && origin.includes('wikipeoplestats.org')

    if ((isDevelopment && isLocalhostOrigin) || isWikipeopleOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin!)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }

    // Obtener el token desde cookies o header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value

    if (!token) {
      console.warn('❌ No se encontró el token')
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401, headers: response.headers })
    }

    // Verificar el token JWT real
    let payload: any
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (err) {
      console.warn('❌ Token inválido:', err)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401, headers: response.headers })
    }

    // Leer información de usuario desde cookie (user_info)
    const userInfoCookie = request.cookies.get('user_info')?.value
    let userData = null

    if (userInfoCookie) {
      try {
        userData = JSON.parse(decodeURIComponent(userInfoCookie))
      } catch (e) {
        console.error('⚠️ Error al parsear user_info:', e)
      }
    }

    if (!userData) {
      console.warn('❌ No se encontró la información del usuario en cookies')
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401, headers: response.headers })
    }

    console.log('✅ Usuario verificado:', userData.username)

    return NextResponse.json({
      user: {
        id: userData.id,
        name: userData.username,
        email: userData.email,
        role: userData.role,
        avatarUrl: userData.avatarUrl,
        wikipediaStats: userData.wikipediaData,
        lastLogin: new Date().toISOString()
      },
      session: {
        id: 'session_' + Date.now(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }, { headers: response.headers })

  } catch (error) {
    console.error('❌ Error verificando autenticación:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const response = new NextResponse(null, { status: 200 })

  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhostOrigin = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))
  const isWikipeopleOrigin = origin && origin.includes('wikipeoplestats.org')

  if ((isDevelopment && isLocalhostOrigin) || isWikipeopleOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin!)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}
