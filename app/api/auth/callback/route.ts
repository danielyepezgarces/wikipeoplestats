import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { Database } from '@/lib/database'

const oauth = require('oauth-1.0a')

// Configuración base
const WIKIMEDIA_OAUTH_URL = 'https://meta.wikimedia.org/w/index.php'
const DEFAULT_ORIGIN = 'www.wikipeoplestats.org'
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.wikipeoplestats.org'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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
    token_exchange_failed: 'Failed to authenticate with Wikimedia',
    user_info_failed: 'Could not retrieve user info',
    session_creation_failed: 'Could not create session',
    authentication_failed: 'Authentication error'
  }

  const errorUrl = new URL(`https://${origin}/login`)
  errorUrl.searchParams.set('error', errorType)
  errorUrl.searchParams.set('message', errorMessages[errorType] || 'An error occurred')
  return NextResponse.redirect(errorUrl.toString())
}

function generateUserAvatar(username: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&rounded=true&size=150&bold=true&length=1`
}

function createOAuthClient() {
  return oauth({
    consumer: {
      key: process.env.WIKIPEDIA_CLIENT_ID || '',
      secret: process.env.WIKIPEDIA_CLIENT_SECRET || ''
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (base_string: string, key: string) =>
      crypto.createHmac('sha1', key).update(base_string).digest('base64')
  })
}

async function getAccessToken(
  oauth_token: string,
  oauth_token_secret: string,
  oauth_verifier: string
): Promise<AccessToken | null> {
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

    if (!response.ok) return null

    const responseText = await response.text()
    const params = new URLSearchParams(responseText)

    return {
      oauth_token: params.get('oauth_token') || '',
      oauth_token_secret: params.get('oauth_token_secret') || ''
    }
  } catch (error) {
    console.error('❌ Error obtaining access token:', error)
    return null
  }
}

async function getUserIdentityFromIdentify(
  oauth_token: string,
  oauth_token_secret: string
): Promise<UserInfo | null> {
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

    if (!response.ok) return null

    const jwtEncoded = await response.text()
    const decoded: any = jwt.decode(jwtEncoded)

    if (!decoded?.sub || !decoded.username) return null

    return {
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email || null,
      editCount: decoded.editcount || 0,
      registrationDate: decoded.registration || ''
    }
  } catch (error) {
    console.error('❌ Error in OAuth/identify:', error)
    return null
  }
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
    encode: encodeURIComponent
  })
  return response
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const oauth_token = searchParams.get('oauth_token')
  const oauth_verifier = searchParams.get('oauth_verifier')
  const origin = searchParams.get('origin') || DEFAULT_ORIGIN

  if (!oauth_token || !oauth_verifier) return redirectToErrorPage(origin, 'missing_parameters')

  const oauth_token_secret = request.cookies.get('oauth_token_secret')?.value
  if (!oauth_token_secret) return redirectToErrorPage(origin, 'session_expired')

  const accessToken = await getAccessToken(oauth_token, oauth_token_secret, oauth_verifier)
  if (!accessToken) return redirectToErrorPage(origin, 'token_exchange_failed')

  const userInfo = await getUserIdentityFromIdentify(
    accessToken.oauth_token,
    accessToken.oauth_token_secret
  )
  if (!userInfo) return redirectToErrorPage(origin, 'user_info_failed')

  try {
    let user = await Database.getUserByWikipediaId(userInfo.id)

    if (!user) {
      // Crear usuario nuevo
      const newUser = await Database.createUser({
        id: userInfo.id,
        wikipedia_id: userInfo.id,
        wikipedia_username: userInfo.username,
        email: userInfo.email,
        is_active: true,
        avatar_url: generateUserAvatar(userInfo.username)
      })
      user = newUser

      const defaultRole = await Database.getRoleByName('user')
      if (defaultRole) {
        await Database.assignRoleToUser(user.id, defaultRole.id)
      }
    } else {
      // Solo actualizar login
      await Database.updateUserLogin(user.id)
    }

    // Crear token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.wikipedia_username,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    const userData = {
      id: user.id,
      username: user.wikipedia_username,
      email: user.email,
      avatarUrl: user.avatar_url
    }

    return createAuthResponse(origin, token, userData)
  } catch (err) {
    console.error('❌ Error creating user or session:', err)
    return redirectToErrorPage(origin, 'session_creation_failed')
  }
}
