// app/api/auth/refresh-roles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { RoleManager } from '@/lib/role-manager'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.wikipeoplestats.org'

export async function POST(request: NextRequest) {
  try {
    // Obtener token actual
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Verificar token actual
    const verification = RoleManager.verifyTokenAndGetRoles(token)
    if (!verification.valid || !verification.payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = verification.payload.userId

    // Generar nuevo token con roles actualizados
    const newToken = await RoleManager.generateUpdatedToken(userId)
    
    // Obtener roles actuales para la respuesta
    const currentRoles = await RoleManager.getUserRoles(userId)

    const response = NextResponse.json({
      success: true,
      roles: currentRoles,
      token_updated: true
    })

    // Actualizar cookie con nuevo token
    response.cookies.set('auth_token', newToken, {
      domain: COOKIE_DOMAIN,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 días
    })

    return response

  } catch (error) {
    console.error('Error refreshing roles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}