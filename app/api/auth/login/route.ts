import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔍 Iniciando proceso de login...')
  
  try {
    // Paso 1: Verificar parámetros
    console.log('📋 Paso 1: Verificando parámetros...')
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get('origin')
    const originDomain = origin || request.headers.get('referer') || 'www.wikipeoplestats.org'
    console.log('✅ Origin domain:', originDomain)

    // Paso 2: Crear URL de autorización de Wikipedia
    console.log('📋 Paso 2: Creando URL de autorización...')
    
    const callbackUrl = `${process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'}/api/auth/callback?origin=${encodeURIComponent(originDomain)}`
    
    // Construir URL de autorización de Wikipedia OAuth
    const authUrl = new URL('https://meta.wikimedia.org/wiki/Special:OAuth/authorize')
    authUrl.searchParams.set('oauth_consumer_key', process.env.WIKIPEDIA_CLIENT_ID || '')
    authUrl.searchParams.set('oauth_callback', callbackUrl)
    
    console.log('✅ URL de autorización creada:', authUrl.toString())

    // Paso 3: Redirigir a Wikipedia
    console.log('📋 Paso 3: Redirigiendo a Wikipedia...')
    return NextResponse.redirect(authUrl.toString())

  } catch (error) {
    console.error('❌ Error general:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      message: 'POST funcionando correctamente',
      receivedData: body 
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Error en POST',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}