export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
  console.log('🔍 Starting Wikimedia OAuth 2.0 login...')

  try {
    // Verify environment variables
    if (!process.env.WIKIMEDIA_OAUTH2_CLIENT_ID || !process.env.WIKIMEDIA_OAUTH2_CLIENT_SECRET) {
      throw new Error('Missing Wikimedia OAuth 2.0 credentials in environment variables')
    }

    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get('origin') || request.headers.get('referer') || 'www.wikipeoplestats.org'
    
    // Generate a secure random state parameter
    const state = randomBytes(16).toString('hex')
    
    // Generate PKCE code verifier and challenge
    const codeVerifier = randomBytes(32).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    // Construct callback URL with origin parameter
    const callbackUrl = new URL(
      process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
    )
    callbackUrl.pathname = '/api/auth/callback'
    callbackUrl.searchParams.set('origin', origin)

    // Construct authorization URL
    const authUrl = new URL('https://meta.wikimedia.org/w/rest.php/oauth2/authorize')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', process.env.WIKIMEDIA_OAUTH2_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', callbackUrl.toString())
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('scope', 'basic') // Adjust scopes as needed
    authUrl.searchParams.set('code_challenge', codeChallenge)
    authUrl.searchParams.set('code_challenge_method', 'S256')

    console.log('🔗 Authorization URL:', authUrl.toString())

    // Create redirect response
    const redirectResponse = NextResponse.redirect(authUrl.toString())

    // Store code verifier and state in secure, HTTP-only cookies
    redirectResponse.cookies.set('wikimedia_oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 300, // 5 minutes
    })

    redirectResponse.cookies.set('wikimedia_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 300, // 5 minutes
    })

    return redirectResponse

  } catch (error) {
    console.error('❌ OAuth 2.0 Error:', error)
    return NextResponse.json({
      error: 'OAuth 2.0 initialization failed',
      details: error instanceof Error ? error.message : String(error),
      suggestion: 'Please verify your OAuth 2.0 client ID and secret'
    }, { status: 500 })
  }
}