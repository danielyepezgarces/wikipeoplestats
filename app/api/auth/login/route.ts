import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  console.log('🔍 Iniciando proceso de login...')

  try {
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get('origin')
    const originDomain = origin || request.headers.get('referer') || 'www.wikipeoplestats.org'

    console.log('📋 Paso 1: Solicitando request token...')

    const oauthCallback = `${process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'}/api/auth/callback?origin=${encodeURIComponent(originDomain)}`

    // Construir cabeceras OAuth (firma manual o usa una librería como oauth-1.0a)
    const oauth = require('oauth-1.0a')
    const axios = require('axios')

    const oauthClient = oauth({
      consumer: {
        key: process.env.WIKIPEDIA_CLIENT_ID || '',
        secret: process.env.WIKIPEDIA_CLIENT_SECRET || '',
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64')
      }
    })

    const requestData = {
      url: 'https://meta.wikimedia.org/w/index.php?title=Special:OAuth/initiate',
      method: 'POST',
      data: { oauth_callback: oauthCallback }
    }

    const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData))

    const response = await axios.post(requestData.url, null, {
      headers: {
        Authorization: authHeader.Authorization
      }
    })

    const tokenData = new URLSearchParams(response.data)
    const oauthToken = tokenData.get('oauth_token')
    const oauthSecret = tokenData.get('oauth_token_secret')

    console.log('✅ Token obtenido:', oauthToken)

    // TODO: Guardar oauthToken y oauthSecret en cookies/sesión para usar en el callback

    const authUrl = `https://meta.wikimedia.org/wiki/Special:OAuth/authorize?oauth_token=${oauthToken}`

    return NextResponse.redirect(authUrl)

  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({
      error: 'Error al iniciar OAuth',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
