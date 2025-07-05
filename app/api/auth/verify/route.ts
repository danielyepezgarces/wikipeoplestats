import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔍 Verificando autenticación...')
  
  try {
    // Configurar CORS para subdominios
    const origin = request.headers.get('origin')
    const response = new NextResponse()
    
    if (origin && origin.includes('wikipeoplestats.org')) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
    
    // Obtener token de cookies o header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value
    
    console.log('📋 Token encontrado:', !!token)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401, headers: response.headers }
      )
    }
    
    // Verificar token (simulado por ahora)
    if (!token.startsWith('simulated_jwt_token_')) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401, headers: response.headers }
      )
    }
    
    // Obtener información del usuario de las cookies
    const userInfoCookie = request.cookies.get('user_info')?.value
    let userData = null
    
    if (userInfoCookie) {
      try {
        userData = JSON.parse(decodeURIComponent(userInfoCookie))
      } catch (e) {
        console.error('Error parsing user info:', e)
      }
    }
    
    if (!userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401, headers: response.headers }
      )
    }
    
    console.log('✅ Usuario verificado:', userData.name)
    
    return NextResponse.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        chapter: userData.chapter,
        wikipediaUsername: userData.wikipediaUsername,
        avatarUrl: userData.avatarUrl,
        lastLogin: new Date().toISOString()
      },
      session: {
        id: 'session_' + Date.now(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }, { headers: response.headers })
    
  } catch (error) {
    console.error('❌ Error verificando token:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const response = new NextResponse(null, { status: 200 })
  
  if (origin && origin.includes('wikipeoplestats.org')) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  return response
}