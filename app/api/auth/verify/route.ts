import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { RoleManager } from '@/lib/role-manager'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {

  try {
    const response = new NextResponse(null, { status: 200 })

    // Obtener el token desde cookies o header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value

    if (!token) {
      console.warn('❌ No se encontró el token')
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401, headers: response.headers })
    }

    // Verificar el token JWT
    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      console.warn('❌ Token inválido:', err)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401, headers: response.headers })
    }

    const userId = payload.userId

    // Obtener información completa del usuario con roles desde la DB
    const userWithRoles = await RoleManager.getUserWithRoles(userId)
    
    if (!userWithRoles) {
      console.warn('❌ Usuario no encontrado en la base de datos')
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401, headers: response.headers })
    }



    return NextResponse.json({
      user: {
        id: userWithRoles.id,
        name: userWithRoles.username,
        email: userWithRoles.email,
        // NO incluimos roles en la respuesta del cliente
        // Los roles se verifican solo en el servidor
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