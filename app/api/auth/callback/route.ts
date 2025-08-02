import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { Database } from "@/lib/database"
import { SessionManager } from "@/lib/session-manager"
import { getWikipediaUserInfo, exchangeCodeForToken } from "@/lib/oauth"

const oauth = require("oauth-1.0a")

const WIKIMEDIA_OAUTH_URL = "https://meta.wikimedia.org/w/index.php"
const DEFAULT_ORIGIN = "www.wikipeoplestats.org"
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ".wikipeoplestats.org"

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
    missing_parameters: "Missing required parameters",
    session_expired: "Session expired, please try again",
    token_exchange_failed: "Failed to authenticate with Wikipedia",
    user_info_failed: "Failed to get user info from Wikipedia",
    session_creation_failed: "Failed to create session",
    authentication_failed: "Authentication error",
    account_claim_failed: "Failed to claim account",
    no_code: "No code provided",
    user_creation_failed: "Failed to create user",
    callback_failed: "Callback failed",
  }

  const errorUrl = new URL(`https://${origin}/login`)
  errorUrl.searchParams.set("error", errorType)
  errorUrl.searchParams.set("message", errorMessages[errorType] || "An error occurred")

  return NextResponse.redirect(errorUrl.toString())
}

function createOAuthClient() {
  return oauth({
    consumer: {
      key: process.env.WIKIPEDIA_CLIENT_ID || "",
      secret: process.env.WIKIPEDIA_CLIENT_SECRET || "",
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string: string, key: string) {
      return crypto.createHmac("sha1", key).update(base_string).digest("base64")
    },
  })
}

async function getAccessToken(
  oauth_token: string,
  oauth_token_secret: string,
  oauth_verifier: string,
): Promise<AccessToken | null> {
  const oauthClient = createOAuthClient()
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/token`,
    method: "POST",
    data: { oauth_token, oauth_verifier },
  }

  const authHeader = oauthClient.toHeader(
    oauthClient.authorize(requestData, { key: oauth_token, secret: oauth_token_secret }),
  )

  try {
    const response = await fetch(requestData.url, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "WikiPeopleStats/1.0",
      },
    })

    if (!response.ok) {
      console.error("❌ Token exchange failed:", await response.text())
      return null
    }

    const text = await response.text()
    const params = new URLSearchParams(text)

    return {
      oauth_token: params.get("oauth_token") || "",
      oauth_token_secret: params.get("oauth_token_secret") || "",
    }
  } catch (error) {
    console.error("❌ Error in getAccessToken:", error)
    return null
  }
}

async function getUserIdentity(oauth_token: string, oauth_token_secret: string): Promise<UserInfo | null> {
  const oauthClient = createOAuthClient()
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/identify`,
    method: "POST",
  }

  const authHeader = oauthClient.toHeader(
    oauthClient.authorize(requestData, { key: oauth_token, secret: oauth_token_secret }),
  )

  try {
    const response = await fetch(requestData.url, {
      method: "POST",
      headers: {
        ...authHeader,
        "User-Agent": "WikiPeopleStats/1.0",
      },
    })

    if (!response.ok) {
      console.error("❌ Failed to get user identity:", await response.text())
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
      registrationDate: decoded.registration || "",
    }
  } catch (error) {
    console.error("❌ Error in getUserIdentity:", error)
    return null
  }
}

function getDeviceInfo(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  let device = "Desktop"
  let browser = "Unknown"
  let os = "Unknown"

  // Detectar dispositivo
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    device = "Mobile"
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    device = "Tablet"
  }

  // Detectar navegador
  if (ua.includes("chrome")) browser = "Chrome"
  else if (ua.includes("firefox")) browser = "Firefox"
  else if (ua.includes("safari")) browser = "Safari"
  else if (ua.includes("edge")) browser = "Edge"

  // Detectar OS
  if (ua.includes("windows")) os = "Windows"
  else if (ua.includes("mac")) os = "macOS"
  else if (ua.includes("linux")) os = "Linux"
  else if (ua.includes("android")) os = "Android"
  else if (ua.includes("ios")) os = "iOS"

  return `${device} - ${browser} on ${os}`
}

function createAuthResponse(origin: string, sessionId: string, userData: any): NextResponse {
  const maxAge = 30 * 24 * 60 * 60 // 30 días en segundos
  const response = NextResponse.redirect(`https://${origin}/dashboard`)

  // Usar session ID en lugar de JWT
  response.cookies.set("session_id", sessionId, {
    domain: COOKIE_DOMAIN,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge,
  })

  // Información básica del usuario (no sensible)
  response.cookies.set(
    "user_info",
    JSON.stringify({
      id: userData.id,
      username: userData.username,
      is_claimed: userData.is_claimed,
    }),
    {
      domain: COOKIE_DOMAIN,
      path: "/",
      secure: true,
      sameSite: "lax",
      maxAge,
    },
  )

  return response
}

/**
 * Handles the OAuth callback GET request.
 * Exchanges request token for access token, fetches user info,
 * creates or updates user in DB, creates server session, and sets cookies.
 */
export async function GET(request: NextRequest) {
  try {
    // Inicializar tablas si es necesario
    await Database.initializeTables()

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code) {
      return redirectToErrorPage(DEFAULT_ORIGIN, "no_code")
    }

    // Intercambiar código por token de acceso
    const tokenData = await exchangeCodeForToken(code)
    if (!tokenData.access_token) {
      return redirectToErrorPage(DEFAULT_ORIGIN, "token_exchange_failed")
    }

    // Obtener información del usuario de Wikipedia
    const userInfo = await getWikipediaUserInfo(tokenData.access_token)
    if (!userInfo) {
      return redirectToErrorPage(DEFAULT_ORIGIN, "user_info_failed")
    }

    // Buscar o crear usuario
    let user = await Database.getUserByWikipediaId(userInfo.sub)

    if (!user) {
      // Verificar si existe un usuario no reclamado con el mismo nombre
      const existingUser = await Database.getUserByUsername(userInfo.username)

      if (existingUser && !existingUser.is_claimed) {
        // Reclamar cuenta existente
        user = await Database.claimUserAccount(existingUser.id, userInfo.sub, userInfo.email)
      } else {
        // Crear nuevo usuario
        user = await Database.createUser({
          wikimedia_id: userInfo.sub,
          username: userInfo.username,
          email: userInfo.email,
          is_claimed: true,
        })

        // Asignar rol por defecto
        await Database.assignDefaultRole(user.id)
      }
    }

    if (!user) {
      return redirectToErrorPage(DEFAULT_ORIGIN, "user_creation_failed")
    }

    // Actualizar último login
    await Database.updateUserLogin(user.id)

    // Crear sesión del servidor
    const sessionId = await SessionManager.createSession(user, {
      origin: request.headers.get("origin") || "unknown",
      userAgent: request.headers.get("user-agent"),
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      deviceInfo: request.headers.get("user-agent"),
    })

    // Crear respuesta de redirección
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    // Establecer cookie de sesión
    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Auth callback error:", error)
    return redirectToErrorPage(DEFAULT_ORIGIN, "callback_failed")
  }
}
