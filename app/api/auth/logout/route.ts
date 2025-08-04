import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/session-manager'

export async function POST(request: NextRequest) {
  console.log('🔍 Procesando logout...')
  
  try {
    const domain = process.env.NEXT_PUBLIC_DOMAIN || '.wikipeoplestats.org'
    const sessionToken = request.cookies.get('session_token')?.value
    
    // Revocar la sesión en la base de datos si existe
    if (sessionToken) {
      await SessionManager.revokeSession(sessionToken)
    }
    
    const response = NextResponse.json({ message: 'Sesión cerrada exitosamente' })
    
    // Limpiar cookies
    response.cookies.set('session_token', '', {
      domain: domain,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0
    })
    
    response.cookies.set('user_info', '', {
      domain: domain,
      path: '/',
      secure: true,
      sameSite: 'lax',
      maxAge: 0
    })
    
    console.log('✅ Cookies limpiadas')
    
    return response
    
  } catch (error) {
    console.error('❌ Error cerrando sesión:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
