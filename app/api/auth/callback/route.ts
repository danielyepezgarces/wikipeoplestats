// FILEPATH: c:/Users/conta/OneDrive/Documentos/GitHub/wikipeoplestats/app/api/auth/callback/route.ts

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { Database } from '@/lib/database'

const oauth = require('oauth-1.0a')

const WIKIMEDIA_OAUTH_URL = 'https://meta.wikimedia.org/w/index.php'
const DEFAULT_ORIGIN = 'www.wikipeoplestats.org'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.wikipeoplestats.org'

interface UserInfo {
  id: string
  username: string
  email: string | null
  editCount: number
  registrationDate: string
}

interface AccessToken {
  oauth_token: string
  oauth_token_secret: string
}

function redirectToErrorPage(origin: string, errorType: string): NextResponse {
  const errorMessages: Record<string, string> = {
    missing_parameters: 'Missing required parameters',
    session_expired: 'Session expired, please try again',
    token_exchange_failed: 'Failed to authenticate with Wikipedia',
    user_info_failed: 'Failed to get user info from Wikipedia',
    session_creation_failed: 'Failed to create session',
    authentication_failed: 'Authentication error',
    domain_restricted: 'Authentication callback accessed from unauthorized domain'
  }

  const errorUrl = new URL(`https://${origin}/login`)
  errorUrl.searchParams.set('error', errorType)
  errorUrl.searchParams.set('message', errorMessages[errorType] || 'An error occurred')

  return NextResponse.redirect(errorUrl.toString())
}

function createOAuthClient() {
  return oauth({
    consumer: {
      key: process.env.WIKIPEDIA_CLIENT_ID || '',
      secret: process.env.WIKIPEDIA_CLIENT_SECRET || ''
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string: string, key: string) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64')
    }
  })
}

async function getAccessToken(oauth_token: string, oauth_token_secret: string, oauth_verifier: string): Promise<AccessToken | null> {
  const oauthClient = createOAuthClient()
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/token`,
    method: 'POST',
    data: { oauth_token, oauth_verifier }
  }

  const authHeader = oauthClient.toHeader(
    oauthClient.authorize(requestData, { key: oauth_token, secret: oauth_token_secret })
  )

  try {
    const response = await fetch(requestData.url, {
      method: 'POST',
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'WikiPeopleStats/1.0'
      }
    })

    if (!response.ok) {
      console.error('❌ Token exchange failed:', await response.text())
      return null
    }

    const text = await response.text()
    const params = new URLSearchParams(text)

    return {
      oauth_token: params.get('oauth_token') || '',
      oauth_token_secret: params.get('oauth_token_secret') || ''
    }
  } catch (error) {
    console.error('❌ Error in getAccessToken:', error)
    return null
  }
}

async function getUserIdentity(oauth_token: string, oauth_token_secret: string): Promise<UserInfo | null> {
  const oauthClient = createOAuthClient()
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/identify`,
    method: 'POST'
  }

  const authHeader = oauthClient.toHeader(
    oauthClient.authorize(requestData, { key: oauth_token, secret: oauth_token_secret })
  )

  try {
    const response = await fetch(requestData.url, {
      method: 'POST',
      headers: {
        ...authHeader,
        'User-Agent': 'WikiPeopleStats/1.0'
      }
    })

    if (!response.ok) {
      console.error('❌ Failed to get user identity:', await response.text())
      return null
    }

    const jwtEncoded = await response.text()
    const decoded: any = jwt.decode(jwtEncoded)

    if (!decoded || !decoded.sub || !decoded.username) return null

    return {
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email || null,
      editCount: decoded.editcount || 0,
      registrationDate: decoded.registration || ''
    }
  } catch (error) {
    console.error('❌ Error in getUserIdentity:', error)
    return null
  }
}

function generateToken(user: { id: number; username: string; email: string | null }) {
  return jwt.sign(
    { userId: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}

function createAuthResponse(origin: string, token: string, userData: any): NextResponse {
  const maxAge = 30 * 24 * 60 * 60
  const response = NextResponse.redirect(`https://${origin}/dashboard`)

  response.cookies.set('auth_token', token, {
    domain: COOKIE_DOMAIN,
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge
  })

  response.cookies.set('user_info', JSON.stringify(userData), {
    domain: COOKIE_DOMAIN,
    path: '/',
    secure: true,
    sameSite: 'lax',
    maxAge,
  })

  return response
}

/**
 * Handles the OAuth callback GET request.
 * Exchanges request token for access token, fetches user info,
 * creates or updates user in DB, creates session, and sets cookies.
 */
export async function GET(request: NextRequest) {
  try {
  
    const searchParams = request.nextUrl.searchParams
    const oauth_token = searchParams.get('oauth_token')
    const oauth_verifier = searchParams.get('oauth_verifier')
    const origin = searchParams.get('origin') || DEFAULT_ORIGIN

    if (!oauth_token || !oauth_verifier) {
      return redirectToErrorPage(origin, 'missing_parameters')
    }

    const oauth_token_secret = request.cookies.get('oauth_token_secret')?.value
    if (!oauth_token_secret) {
      return redirectToErrorPage(origin, 'session_expired')
    }

    const accessToken = await getAccessToken(oauth_token, oauth_token_secret, oauth_verifier)
    if (!accessToken) return redirectToErrorPage(origin, 'token_exchange_failed')

    const userInfo = await getUserIdentity(accessToken.oauth_token, accessToken.oauth_token_secret)
    if (!userInfo) return redirectToErrorPage(origin, 'user_info_failed')

    let user = await Database.getUserByWikipediaId(userInfo.id)

    if (!user) {
      console.log('🆕 Creating new user...')
      user = await Database.createUser({
        wikimedia_id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email ?? undefined,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.username)}&background=random&color=fff&rounded=true&size=150`
      })
    }

    await Database.updateUserLogin(user.id)

    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email || null
    })

    await Database.createSession({
      user_id: user.id,
      token_hash: token,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' '),
      origin_domain: origin,
      user_agent: request.headers.get('user-agent') || '',
      ip_address: request.headers.get('x-forwarded-for') || ''
    })

    return createAuthResponse(origin, token, {
      id: user.id,
      username: user.username,
      email: user.email
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return new NextResponse(`Internal Server Error: ${message}`, { status: 500 })
  }
}