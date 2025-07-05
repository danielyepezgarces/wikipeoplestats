import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
const oauth = require('oauth-1.0a')

const WIKIMEDIA_OAUTH_URL = 'https://meta.wikimedia.org/w/index.php'
const DEFAULT_ORIGIN = 'www.wikipeoplestats.org'
const AUTH_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.wikipeoplestats.org'

interface UserInfo {
  id: string
  username: string
  email: string | null
  editCount: number
  registrationDate: string
}

function redirectToErrorPage(origin: string, errorType: string, debug?: any): NextResponse {
  const errorMessages: Record<string, string> = {
    missing_parameters: 'Faltan parámetros requeridos',
    session_expired: 'La sesión expiró',
    token_exchange_failed: 'Error al autenticar',
    user_info_failed: 'No pudimos obtener tu información',
    session_creation_failed: 'Error al crear tu sesión',
    authentication_failed: 'Error de autenticación general'
  }

  const errorUrl = new URL(`https://${origin}/login`)
  errorUrl.searchParams.set('error', errorType)
  errorUrl.searchParams.set('message', errorMessages[errorType] || 'Error desconocido')

  if (debug) {
    try {
      errorUrl.searchParams.set('debug', encodeURIComponent(JSON.stringify(debug)))
    } catch (e) {
      console.warn('❗ No se pudo codificar debug:', e)
    }
  }

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
    hash_function: (base_string: string, key: string) => {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64')
    }
  })
}

async function getWikipediaUserInfo(oauth_token: string, oauth_token_secret: string): Promise<{ user: UserInfo | null, debug?: any }> {
  const oauthClient = createOAuthClient()
  const request = {
    url: 'https://meta.wikimedia.org/w/api.php?action=query&meta=userinfo&uiprop=id|name|email|editcount|registrationdate&format=json',
    method: 'GET'
  }
  const authHeader = oauthClient.toHeader(oauthClient.authorize(request, {
    key: oauth_token,
    secret: oauth_token_secret
  }))
  try {
    const res = await fetch(request.url, {
      headers: {
        Authorization: authHeader.Authorization,
        'User-Agent': 'WikiPeopleStats/1.0',
        Accept: 'application/json'
      }
    })
    const data = await res.json()

    if (!res.ok || data?.error || !data?.query?.userinfo) {
      return { user: null, debug: data }
    }

    const u = data.query.userinfo
    if (!u.id || !u.name) return { user: null, debug: u }

    return {
      user: {
        id: u.id.toString(),
        username: u.name,
        email: u.email || null,
        editCount: u.editcount || 0,
        registrationDate: u.registrationdate || ''
      }
    }
  } catch (err) {
    return { user: null, debug: { error: err } }
  }
}

async function getWikipediaUserInfoBasic(oauth_token: string, oauth_token_secret: string): Promise<{ user: UserInfo | null, debug?: any }> {
  const oauthClient = createOAuthClient()
  const request = {
    url: 'https://meta.wikimedia.org/w/api.php?action=query&meta=userinfo&uiprop=id|name|email&formatversion=2&format=json',
    method: 'GET'
  }
  const authHeader = oauthClient.toHeader(oauthClient.authorize(request, {
    key: oauth_token,
    secret: oauth_token_secret
  }))
  try {
    const res = await fetch(request.url, {
      headers: {
        Authorization: authHeader.Authorization,
        'User-Agent': 'WikiPeopleStats/1.0',
        Accept: 'application/json'
      }
    })
    const data = await res.json()

    if (!res.ok || data?.error || !data?.query?.userinfo) {
      return { user: null, debug: data }
    }

    const u = data.query.userinfo
    if (!u.id || !u.name) return { user: null, debug: u }

    return {
      user: {
        id: u.id.toString(),
        username: u.name,
        email: u.email || null,
        editCount: 0,
        registrationDate: ''
      }
    }
  } catch (err) {
    return { user: null, debug: { error: err } }
  }
}

async function getAccessToken(oauth_token: string, oauth_token_secret: string, oauth_verifier: string) {
  const oauthClient = createOAuthClient()
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/token`,
    method: 'POST',
    data: { oauth_verifier }
  }

  const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData, {
    key: oauth_token,
    secret: oauth_token_secret
  }))

  const body = new URLSearchParams()
  body.append('oauth_verifier', oauth_verifier)

  const response = await fetch(requestData.url, {
    method: 'POST',
    headers: {
      Authorization: authHeader.Authorization,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'WikiPeopleStats/1.0'
    },
    body: body.toString()
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Access Token Error:', errorText)
    return null
  }

  const text = await response.text()
  const params = new URLSearchParams(text)

  return {
    oauth_token: params.get('oauth_token') || '',
    oauth_token_secret: params.get('oauth_token_secret') || ''
  }
}

async function createUserSession(user: UserInfo) {
  const userData = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: 'contributor',
    wikipediaData: {
      editCount: user.editCount,
      registrationDate: user.registrationDate
    },
    avatarUrl: generateUserAvatar(user.username)
  }

  const token = jwt.sign({
    userId: user.id,
    username: user.username,
    email: user.email,
    role: 'contributor'
  }, JWT_SECRET, { expiresIn: '30d' })

  return { token, userData }
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

  if (!oauth_token || !oauth_verifier) {
    return redirectToErrorPage(origin, 'missing_parameters')
  }

  const oauth_token_secret = request.cookies.get('oauth_token_secret')?.value
  if (!oauth_token_secret) {
    return redirectToErrorPage(origin, 'session_expired')
  }

  const accessToken = await getAccessToken(oauth_token, oauth_token_secret, oauth_verifier)
  if (!accessToken) {
    return redirectToErrorPage(origin, 'token_exchange_failed')
  }

  const { user: mainUser, debug: debug1 } = await getWikipediaUserInfo(accessToken.oauth_token, accessToken.oauth_token_secret)

  if (!mainUser) {
    const { user: fallbackUser, debug: debug2 } = await getWikipediaUserInfoBasic(accessToken.oauth_token, accessToken.oauth_token_secret)
    if (!fallbackUser) {
      return redirectToErrorPage(origin, 'user_info_failed', { debug1, debug2 })
    }

    const session = await createUserSession(fallbackUser)
    if (!session) return redirectToErrorPage(origin, 'session_creation_failed')

    const response = createAuthResponse(origin, session.token, session.userData)
    response.cookies.delete('oauth_token_secret')
    return response
  }

  const session = await createUserSession(mainUser)
  if (!session) return redirectToErrorPage(origin, 'session_creation_failed')

  const response = createAuthResponse(origin, session.token, session.userData)
  response.cookies.delete('oauth_token_secret')
  return response
}
