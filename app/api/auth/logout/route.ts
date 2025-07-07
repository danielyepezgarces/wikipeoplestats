import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔍 Procesando logout...')
  
  try {
    const hostname = request.nextUrl.hostname
    const AUTH_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN?.replace('https://', '') || 'auth.wikipeoplestats.org'
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // Verificación de dominio para logout
    if (!isDevelopment && hostname !== AUTH_DOMAIN) {
      console.log(`❌ Logout accessed from unauthorized domain: ${hostname}`)
      return NextResponse.json({
        error: 'Domain restriction',
        message: 'Logout can only be performed from the authorized authentication domain'
      }, { status: 403 })
    }

    console.log(`🔐 Logout initiated from authorized domain: ${hostname}`)
    
    const domain = process.env.NEXT_PUBLIC_DOMAIN || '.wikipeoplestats.org'
    
    const response = NextResponse.json({ message: 'Sesión cerrada exitosamente' })
    
    // Limpiar cookies
    response.cookies.set('auth_token', '', {
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