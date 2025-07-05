import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔍 Procesando callback de Wikipedia...')
  
  try {
    const searchParams = request.nextUrl.searchParams
    const oauth_token = searchParams.get('oauth_token')
    const oauth_verifier = searchParams.get('oauth_verifier')
    const origin = searchParams.get('origin')
    
    console.log('📋 Parámetros recibidos:', { oauth_token, oauth_verifier, origin })
    
    if (!oauth_token || !oauth_verifier) {
      console.error('❌ Faltan parámetros OAuth')
      const errorUrl = `https://${origin || 'www.wikipeoplestats.org'}/login?error=authorization_failed`
      return NextResponse.redirect(errorUrl)
    }
    
    // Aquí deberías procesar el token con Wikipedia OAuth
    // Por ahora, simularemos un usuario exitoso
    console.log('✅ Simulando autenticación exitosa...')
    
    // Crear datos de usuario simulados
    const userData = {
      id: 'user_123',
      name: 'Usuario de Prueba',
      email: 'test@example.com',
      role: 'community_partner',
      chapter: 'Global',
      wikipediaUsername: 'TestUser',
      avatarUrl: 'https://via.placeholder.com/150'
    }
    
    // Crear token JWT simulado
    const jwtToken = 'simulated_jwt_token_' + Date.now()
    
    // Configurar cookies para el dominio principal
    const domain = process.env.NEXT_PUBLIC_DOMAIN || '.wikipeoplestats.org'
    const maxAge = 30 * 24 * 60 * 60 // 30 días
    
    const response = NextResponse.redirect(`https://${origin || 'www.wikipeoplestats.org'}/dashboard`)
    
    // Configurar cookies
    response.cookies.set('auth_token', jwtToken, {
      domain: domain,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: maxAge
    })
    
    response.cookies.set('user_info', encodeURIComponent(JSON.stringify(userData)), {
      domain: domain,
      path: '/',
      secure: true,
      sameSite: 'lax',
      maxAge: maxAge
    })
    
    console.log('✅ Cookies configuradas, redirigiendo a:', `https://${origin}/dashboard`)
    
    return response
    
  } catch (error) {
    console.error('❌ Error en callback:', error)
    const errorUrl = `https://${request.nextUrl.searchParams.get('origin') || 'www.wikipeoplestats.org'}/login?error=authentication_failed`
    return NextResponse.redirect(errorUrl)
  }
}