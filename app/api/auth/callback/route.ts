import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const oauth = require('oauth-1.0a')

// Configuración base
const WIKIMEDIA_OAUTH_URL = 'https://meta.wikimedia.org/w/index.php'
const DEFAULT_ORIGIN = 'www.wikipeoplestats.org'
const AUTH_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.wikipeoplestats.org'

// Tipos de datos
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

// Función para redireccionar a páginas de error
function redirectToErrorPage(origin: string, errorType: string): NextResponse {
  const errorMessages: Record<string, string> = {
    missing_parameters: 'Faltan parámetros requeridos',
    session_expired: 'La sesión expiró, por favor intenta nuevamente',
    token_exchange_failed: 'Error al autenticar con Wikipedia',
    user_info_failed: 'No pudimos obtener tu información de Wikipedia',
    session_creation_failed: 'Error al crear tu sesión',
    authentication_failed: 'Error durante la autenticación'
  }

  const errorUrl = new URL(`https://${origin}/login`)
  errorUrl.searchParams.set('error', errorType)
  errorUrl.searchParams.set('message', errorMessages[errorType] || 'Ocurrió un error')

  console.log(`🔴 Redirigiendo a página de error: ${errorType}`)
  return NextResponse.redirect(errorUrl.toString())
}

// Función para generar avatar dinámico
function generateUserAvatar(username: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}` +
    `&background=random` +
    `&color=fff` +
    `&rounded=true` +
    `&size=150` +
    `&bold=true` +
    `&length=1`
}

// Cliente OAuth reusable
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

// CORRECCIÓN 1: Obtener access token de Wikipedia
async function getAccessToken(oauth_token: string, oauth_token_secret: string, oauth_verifier: string): Promise<AccessToken | null> {
  console.log('🔑 Obteniendo access token de Wikipedia...')
  
  const oauthClient = createOAuthClient()
  
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/token`,
    method: 'POST',
    data: {
      oauth_verifier // Solo enviamos el verifier
    }
  }
  
  const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData, {
    key: oauth_token,
    secret: oauth_token_secret
  }))
  
  try {
    // CORRECCIÓN: Enviar datos como form-data en el body
    const formData = new URLSearchParams()
    formData.append('oauth_verifier', oauth_verifier)
    
    const response = await fetch(requestData.url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader.Authorization, // CORRECCIÓN: Solo la propiedad Authorization
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'WikiPeopleStats/1.0 (https://wikipeoplestats.org; contact@wikipeoplestats.org)'
      },
      body: formData.toString()
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error al obtener access token:', response.status, errorText)
      return null
    }
    
    const responseText = await response.text()
    console.log('Respuesta del access token:', responseText)
    
    const params = new URLSearchParams(responseText)
    
    const accessToken = {
      oauth_token: params.get('oauth_token') || '',
      oauth_token_secret: params.get('oauth_token_secret') || ''
    }
    
    if (!accessToken.oauth_token || !accessToken.oauth_token_secret) {
      console.error('Access token incompleto:', accessToken)
      return null
    }
    
    return accessToken
  } catch (error) {
    console.error('Error en la solicitud de access token:', error)
    return null
  }
}

// CORRECCIÓN 2: Obtener información del usuario de Wikipedia
async function getWikipediaUserInfo(oauth_token: string, oauth_token_secret: string): Promise<UserInfo | null> {
  console.log('👤 Obteniendo información del usuario de Wikipedia...')
  
  const oauthClient = createOAuthClient()
  
  // CORRECCIÓN: Agregar assertuser y mejorar el endpoint
  const userInfoRequest = {
    url: `https://meta.wikimedia.org/w/api.php?` +
         `action=query&` +
         `meta=userinfo&` +
         `uiprop=id|name|email|editcount|registrationdate|groups|rights&` +
         `assertuser=user&` + // IMPORTANTE: Verificar que el usuario está autenticado
         `format=json`,
    method: 'GET'
  }
  
  const authHeader = oauthClient.toHeader(oauthClient.authorize(userInfoRequest, {
    key: oauth_token,
    secret: oauth_token_secret
  }))
  
  try {
    const response = await fetch(userInfoRequest.url, {
      headers: {
        'Authorization': authHeader.Authorization, // CORRECCIÓN: Solo Authorization
        'User-Agent': 'WikiPeopleStats/1.0 (https://wikipeoplestats.org; contact@wikipeoplestats.org)',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error HTTP al obtener información del usuario:', response.status, errorText)
      return null
    }
    
    const data = await response.json()
    console.log('Respuesta completa de userinfo:', JSON.stringify(data, null, 2))
    
    // CORRECCIÓN: Verificar errores de la API
    if (data.error) {
      console.error('Error de la API de Wikipedia:', data.error)
      return null
    }
    
    // CORRECCIÓN: Verificar si el usuario está autenticado
    if (data.query?.userinfo?.anon !== undefined) {
      console.error('Usuario no autenticado - respuesta anónima recibida')
      return null
    }
    
    // Verificar estructura de respuesta
    if (!data?.query?.userinfo) {
      console.error('Estructura de respuesta inválida:', data)
      return null
    }
    
    const userinfo = data.query.userinfo
    
    // CORRECCIÓN: Verificar que tenemos datos mínimos
    if (!userinfo.id || !userinfo.name) {
      console.error('Datos de usuario incompletos:', userinfo)
      return null
    }
    
    return {
      id: userinfo.id.toString(),
      username: userinfo.name,
      email: userinfo.email || null,
      editCount: userinfo.editcount || 0,
      registrationDate: userinfo.registrationdate || ''
    }
  } catch (error) {
    console.error('Error al obtener información del usuario:', error)
    return null
  }
}

// CORRECCIÓN 3: Función alternativa para debug
async function debugWikipediaAuth(oauth_token: string, oauth_token_secret: string): Promise<void> {
  console.log('🔍 Debugging autenticación de Wikipedia...')
  
  const oauthClient = createOAuthClient()
  
  // Probar endpoint básico primero
  const testRequest = {
    url: 'https://meta.wikimedia.org/w/api.php?action=query&meta=userinfo&format=json',
    method: 'GET'
  }
  
  const authHeader = oauthClient.toHeader(oauthClient.authorize(testRequest, {
    key: oauth_token,
    secret: oauth_token_secret
  }))
  
  console.log('Headers generados:', authHeader)
  
  try {
    const response = await fetch(testRequest.url, {
      headers: {
        'Authorization': authHeader.Authorization,
        'User-Agent': 'WikiPeopleStats/1.0 (https://wikipeoplestats.org; contact@wikipeoplestats.org)',
        'Accept': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('Respuesta de debug:', JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.error('Error en debug:', error)
  }
}

// Crear sesión de usuario en nuestro sistema
async function createUserSession(userInfo: UserInfo): Promise<{ token: string; userData: any } | null> {
  console.log('🔐 Creando sesión de usuario...')
  
  try {
    const userData = {
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      role: 'contributor',
      wikipediaData: {
        editCount: userInfo.editCount,
        registrationDate: userInfo.registrationDate
      },
      avatarUrl: generateUserAvatar(userInfo.username)
    }
    
    const token = jwt.sign(
      { 
        userId: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )
    
    return { token, userData }
  } catch (error) {
    console.error('Error al crear sesión de usuario:', error)
    return null
  }
}

// Crear respuesta de autenticación con cookies
function createAuthResponse(origin: string, token: string, userData: any): NextResponse {
  const maxAge = 30 * 24 * 60 * 60 // 30 días
  
  const response = NextResponse.redirect(`https://${origin}/dashboard`)
  
  response.cookies.set('auth_token', token, {
    domain: COOKIE_DOMAIN,
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: maxAge
  })
  
  response.cookies.set('user_info', JSON.stringify(userData), {
    domain: COOKIE_DOMAIN,
    path: '/',
    secure: true,
    sameSite: 'lax',
    maxAge: maxAge,
    encode: (value) => encodeURIComponent(value)
  })
  
  return response
}

// --- Función principal ---
export async function GET(request: NextRequest) {
  console.log('🔍 Procesando callback de autenticación de Wikipedia...')
  
  try {
    const searchParams = request.nextUrl.searchParams
    const oauth_token = searchParams.get('oauth_token')
    const oauth_verifier = searchParams.get('oauth_verifier')
    const origin = searchParams.get('origin') || DEFAULT_ORIGIN
    
    console.log('📋 Parámetros recibidos:', { oauth_token, oauth_verifier, origin })
    
    // Validación básica de parámetros
    if (!oauth_token || !oauth_verifier) {
      console.error('❌ Faltan parámetros OAuth requeridos')
      return redirectToErrorPage(origin, 'missing_parameters')
    }
    
    // Recuperar el oauth_token_secret de las cookies
    const oauth_token_secret = request.cookies.get('oauth_token_secret')?.value
    if (!oauth_token_secret) {
      console.error('❌ No se encontró oauth_token_secret en cookies')
      return redirectToErrorPage(origin, 'session_expired')
    }
    
    console.log('🔑 Tokens OAuth:', { oauth_token, oauth_token_secret })
    
    // Paso 1: Obtener access token
    const accessToken = await getAccessToken(oauth_token, oauth_token_secret, oauth_verifier)
    if (!accessToken) {
      console.error('❌ Error al obtener access token')
      return redirectToErrorPage(origin, 'token_exchange_failed')
    }
    
    console.log('✅ Access token obtenido')
    
    // CORRECCIÓN: Agregar debug si es necesario
    if (process.env.NODE_ENV === 'development') {
      await debugWikipediaAuth(accessToken.oauth_token, accessToken.oauth_token_secret)
    }
    
    // Paso 2: Obtener información del usuario
    const userInfo = await getWikipediaUserInfo(accessToken.oauth_token, accessToken.oauth_token_secret)
    if (!userInfo) {
      console.error('❌ Error al obtener información del usuario')
      return redirectToErrorPage(origin, 'user_info_failed')
    }
    
    console.log('✅ Información del usuario obtenida:', userInfo.username)
    
    // Paso 3: Crear sesión de usuario
    const sessionData = await createUserSession(userInfo)
    if (!sessionData) {
      console.error('❌ Error al crear sesión de usuario')
      return redirectToErrorPage(origin, 'session_creation_failed')
    }
    
    // Paso 4: Limpiar cookies temporales
    const response = createAuthResponse(origin, sessionData.token, sessionData.userData)
    response.cookies.delete('oauth_token_secret')
    
    console.log('✅ Autenticación exitosa para usuario:', userInfo.username)
    return response
    
  } catch (error) {
    console.error('❌ Error en el proceso de callback:', error)
    const origin = request.nextUrl.searchParams.get('origin') || DEFAULT_ORIGIN
    return redirectToErrorPage(origin, 'authentication_failed')
  }
}