import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const oauth = require('oauth-1.0a')
const axios = require('axios')

export async function GET(request: NextRequest) {
  console.log('🔍 Iniciando proceso de login OAuth con Wikimedia...')

  try {
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get('origin')
    const originDomain = origin || request.headers.get('referer') || 'www.wikipeoplestats.org'

    const oauthCallback = `${process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'}/api/auth/callback?origin=${encodeURIComponent(originDomain)}`
    console.log('📋 Callback URL:', oauthCallback)

    // Preparar firma OAuth
    const oauthClient = oauth({
      consumer: {
        key: process.env.WIKIPEDIA_CLIENT_ID || '',
        secret: process.env.WIKIPEDIA_CLIENT_SECRET || '',
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64')
      },
    })

    const requestData = {
      url: 'https://meta.wikimedia.org/w/index.php?title=Special:OAuth/initiate',
      method: 'POST',
      data: { oauth_callback: oauthCallback },
    }

    const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData))

    const response = await axios.post(requestData.url, null, {
      headers: {
        Authorization: authHeader.Authorization,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'WikiPeopleStats/1.0', // Add user agent
      },
      responseType: 'text',
    })

    console.log('🔧 Respuesta cruda:', response.data)

    // Try different parsing methods
    let oauthToken: string | null = null
    let oauthSecret: string | null = null

    // Method 1: Try URLSearchParams
    try {
      const tokenData = new URLSearchParams(response.data)
      oauthToken = tokenData.get('oauth_token')
      oauthSecret = tokenData.get('oauth_token_secret')
      console.log('🔍 Intento de parseo con URLSearchParams:', { oauthToken, oauthSecret })
    } catch (e) {
      console.log('⚠️ URLSearchParams no funcionó, probando otro método')
    }

    // Method 2: Try manual parsing if first method failed
    if (!oauthToken || !oauthSecret) {
      const matches = response.data.match(/oauth_token=([^&]+)/)
      if (matches) oauthToken = matches[1]
      const secretMatches = response.data.match(/oauth_token_secret=([^&]+)/)
      if (secretMatches) oauthSecret = secretMatches[1]
      console.log('🔍 Intento de parseo con regex:', { oauthToken, oauthSecret })
    }

    if (!oauthToken || !oauthSecret) {
      console.error('❌ Formato de respuesta inesperado:', response.data)
      throw new Error(`No se pudo obtener el oauth_token o el oauth_token_secret. Respuesta: ${response.data}`)
    }

    console.log('✅ Token obtenido correctamente:', oauthToken)

    // Preparar redirección a Wikimedia con oauth_token
    const authUrl = `https://meta.wikimedia.org/wiki/Special:OAuth/authorize?oauth_token=${oauthToken}`
    const redirectResponse = NextResponse.redirect(authUrl)

    // Guardar el oauth_token_secret temporalmente en cookies (seguro, httpOnly)
    redirectResponse.cookies.set('oauth_token_secret', oauthSecret, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 300, // 5 minutos
    })

    return redirectResponse

  } catch (error) {
    console.error('❌ Error general:', error)
    return NextResponse.json({
      error: 'Error al iniciar OAuth',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}