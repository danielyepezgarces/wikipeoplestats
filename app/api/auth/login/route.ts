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

    // Prepare both the required 'oob' and our actual callback
    const oauthCallback = "oob" // Wikimedia requires this exact value
    const realCallback = `${process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'}/api/auth/callback?origin=${encodeURIComponent(originDomain)}`
    console.log('📋 Callback URLs:', { oauthCallback, realCallback })

    // OAuth configuration
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
      data: { 
        oauth_callback: oauthCallback,
        wikipeoplestats_callback: realCallback // Passing our real callback separately
      },
    }

    const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData))

    const response = await axios.post(requestData.url, null, {
      headers: {
        Authorization: authHeader.Authorization,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'WikiPeopleStats/1.0',
      },
    })

    // Parse the response
    const responseParams = new URLSearchParams(response.data)
    const oauthToken = responseParams.get('oauth_token')
    const oauthSecret = responseParams.get('oauth_token_secret')

    if (!oauthToken || !oauthSecret) {
      throw new Error(`Failed to get tokens. Response: ${response.data}`)
    }

    console.log('✅ Tokens obtained:', { oauthToken, oauthSecret })

    // Redirect to authorization page
    const authUrl = `https://meta.wikimedia.org/wiki/Special:OAuth/authorize?oauth_token=${oauthToken}&wikipeoplestats_callback=${encodeURIComponent(realCallback)}`
    const redirectResponse = NextResponse.redirect(authUrl)

    // Store both tokens securely
    redirectResponse.cookies.set('oauth_token_secret', oauthSecret, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 300,
    })

    return redirectResponse

  } catch (error) {
    console.error('❌ OAuth Error:', error)
    return NextResponse.json({
      error: 'OAuth initialization failed',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}