import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const oauth = require('oauth-1.0a')

export async function GET(request: NextRequest) {
  console.log('🔍 Procesando callback de autenticación de Wikipedia...')
  
  try {
    const searchParams = request.nextUrl.searchParams
    const oauth_token = searchParams.get('oauth_token')
    const oauth_verifier = searchParams.get('oauth_verifier')
    const origin = searchParams.get('origin') || 'www.wikipeoplestats.org'
    
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
    
    // Paso 1: Obtener access token
    const accessToken = await getAccessToken(oauth_token, oauth_token_secret, oauth_verifier)
    if (!accessToken) {
      console.error('❌ Error al obtener access token')
      return redirectToErrorPage(origin, 'token_exchange_failed')
    }
    
    // Paso 2: Obtener información del usuario (incluyendo email si está disponible)
    const userInfo = await getWikipediaUserInfo(accessToken.oauth_token, accessToken.oauth_token_secret)
    if (!userInfo) {
      console.error('❌ Error al obtener información del usuario')
      return redirectToErrorPage(origin, 'user_info_failed')
    }
    
    // Paso 3: Crear sesión de usuario (con email real o null)
    const sessionData = await createUserSession(userInfo, origin)
    if (!sessionData) {
      console.error('❌ Error al crear sesión de usuario')
      return redirectToErrorPage(origin, 'session_creation_failed')
    }
    
    // Paso 4: Redirigir al dashboard con las cookies configuradas
    console.log('✅ Autenticación exitosa para usuario:', userInfo.username)
    return createAuthResponse(origin, sessionData.token, sessionData.userData)
    
  } catch (error) {
    console.error('❌ Error en el proceso de callback:', error)
    const origin = request.nextUrl.searchParams.get('origin') || 'www.wikipeoplestats.org'
    return redirectToErrorPage(origin, 'authentication_failed')
  }
}

// --- Funciones auxiliares actualizadas ---

async function getWikipediaUserInfo(oauth_token: string, oauth_token_secret: string) {
  console.log('👤 Obteniendo información del usuario de Wikipedia...')
  
  const oauthClient = createOAuthClient()
  
  // 1. Obtener identidad básica
  const identityRequest = {
    url: 'https://meta.wikimedia.org/w/index.php?title=Special:OAuth/identify',
    method: 'GET'
  }
  
  const authHeader = oauthClient.toHeader(oauthClient.authorize(identityRequest, {
    key: oauth_token,
    secret: oauth_token_secret
  }))
  
  try {
    const response = await fetch(identityRequest.url, {
      headers: {
        ...authHeader,
        'User-Agent': 'WikiPeopleStats/1.0',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('Error al obtener identidad:', await response.text())
      return null
    }
    
    const identityData = await response.json()
    
    // 2. Obtener información extendida del usuario (incluyendo email si está disponible)
    const userInfoRequest = {
      url: `https://meta.wikimedia.org/w/api.php?` +
           `action=query&` +
           `meta=userinfo&` +
           `uiprop=email|editcount|registration&` + // Solicitar email explícitamente
           `format=json`,
      method: 'GET'
    }
    
    const userAuthHeader = oauthClient.toHeader(oauthClient.authorize(userInfoRequest, {
      key: oauth_token,
      secret: oauth_token_secret
    }))
    
    const userResponse = await fetch(userInfoRequest.url, {
      headers: {
        ...userAuthHeader,
        'User-Agent': 'WikiPeopleStats/1.0',
        'Accept': 'application/json'
      }
    })
    
    if (!userResponse.ok) {
      console.error('Error al obtener información del usuario:', await userResponse.text())
      return null
    }
    
    const userData = await userResponse.json()
    
    return {
      username: identityData.username,
      id: identityData.sub,
      email: userData.query.userinfo.email || null, // Email real o null
      editCount: userData.query.userinfo.editcount,
      registrationDate: userData.query.userinfo.registration
    }
  } catch (error) {
    console.error('Error al obtener información del usuario:', error)
    return null
  }
}

async function createUserSession(userInfo: any, origin: string) {
  console.log('🔐 Creando sesión de usuario...')
  
  // Aquí deberías implementar la lógica para:
  // 1. Buscar/crear el usuario en tu base de datos
  // 2. Asignar roles según tu sistema (no basado en Wikipedia)
  
  // Ejemplo con datos del usuario real
  const userData = {
    id: userInfo.id,
    username: userInfo.username,
    email: userInfo.email, // Email real o null
    role: 'contributor', // Rol por defecto (ajusta según tu lógica)
    wikipediaData: {
      editCount: userInfo.editCount,
      registrationDate: userInfo.registrationDate
    },
    avatarUrl: ``
  }
  
  // Generar token JWT (usa tu secreto real)
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
  const token = jwt.sign(
    { 
      userId: userData.id,
      username: userData.username,
      email: userData.email, // Incluir email en el token si lo necesitas
      role: userData.role 
    },
    jwtSecret,
    { expiresIn: '30d' }
  )
  
  return { token, userData }
}

