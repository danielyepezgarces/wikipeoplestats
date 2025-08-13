import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { Database } from "@/lib/database"
import { createTokenPair, decodeToken } from "@/lib/jwt"

const oauth = require("oauth-1.0a")

const WIKIMEDIA_OAUTH_URL = "https://meta.wikimedia.org/w/index.php"
const DEFAULT_ORIGIN = "www.wikipeoplestats.org"

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

export async function GET(request: NextRequest) {
  console.log("🔄 Processing OAuth callback...")

  try {
    const searchParams = request.nextUrl.searchParams
    const oauthToken = searchParams.get("oauth_token")
    const oauthVerifier = searchParams.get("oauth_verifier")
    const origin = request.cookies.get("oauth_origin")?.value || "www.wikipeoplestats.org"

    console.log("📥 Callback params:")
    console.log("  - oauth_token:", oauthToken?.substring(0, 8) + "...")
    console.log("  - oauth_verifier:", oauthVerifier?.substring(0, 8) + "...")
    console.log("  - origin:", origin)

    if (!oauthToken || !oauthVerifier) {
      throw new Error("Missing OAuth parameters in callback")
    }

    // Obtener el token secret de las cookies
    const oauthTokenSecret = request.cookies.get("oauth_token_secret")?.value
    if (!oauthTokenSecret) {
      throw new Error("OAuth token secret not found in cookies")
    }

    console.log("🔐 Token secret found in cookies")

    const oauthClient = createOAuthClient()

    // Intercambiar por access token
    const accessTokenData = {
      url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/token`,
      method: "POST",
      data: {
        oauth_verifier: oauthVerifier,
      },
    }

    const token = {
      key: oauthToken,
      secret: oauthTokenSecret,
    }

    console.log("📤 Requesting access token...")

    const authHeader = oauthClient.toHeader(oauthClient.authorize(accessTokenData, token))

    const accessTokenResponse = await fetch(accessTokenData.url, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "WikiPeopleStats/1.0",
      },
      body: new URLSearchParams(accessTokenData.data),
    })

    if (!accessTokenResponse.ok) {
      const errorText = await accessTokenResponse.text()
      console.error("❌ Access token request failed:", errorText)
      throw new Error(`Access token request failed: ${accessTokenResponse.status}`)
    }

    const accessTokenText = await accessTokenResponse.text()
    console.log("📄 Access token response:", accessTokenText)

    const accessParams = new URLSearchParams(accessTokenText)
    const accessToken = accessParams.get("oauth_token")
    const accessTokenSecret = accessParams.get("oauth_token_secret")

    if (!accessToken || !accessTokenSecret) {
      throw new Error("Failed to get access token from response")
    }

    console.log("✅ Access token obtained")

    // Obtener información del usuario usando el método identify
    const identifyData = {
      url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/identify`,
      method: "GET",
      data: {},
    }

    const userToken = {
      key: accessToken,
      secret: accessTokenSecret,
    }

    console.log("👤 Requesting user information...")

    const identifyAuthHeader = oauthClient.toHeader(oauthClient.authorize(identifyData, userToken))

    const userResponse = await fetch(identifyData.url, {
      method: "GET",
      headers: {
        ...identifyAuthHeader,
        "User-Agent": "WikiPeopleStats/1.0",
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error("❌ User info request failed:", errorText)
      throw new Error(`User info request failed: ${userResponse.status}`)
    }

    const userData = await userResponse.json()
    console.log("👤 User info obtained:", userData.username)

    // Buscar o crear usuario en la base de datos
    let user = await Database.getUserByWikipediaId(userData.sub.toString())

    if (!user) {
      // Crear nuevo usuario
      console.log("👤 Creating new user:", userData.username)
      user = await Database.createUser({
        wikimedia_id: userData.sub.toString(),
        username: userData.username,
        email: userData.email,
        registration_date: userData.registered,
        is_claimed: true,
      })

      if (user) {
        await Database.assignDefaultRole(user.id)
      }
    } else {
      // Actualizar información del usuario existente
      console.log("👤 Updating existing user:", user.username)
      if (!user.is_claimed) {
        user = await Database.claimUserAccount(user.id, userData.sub.toString(), userData.email)
      }
    }

    if (!user) {
      throw new Error("Failed to create or update user")
    }

    // Actualizar último login
    await Database.updateUserLogin(user.id)

    // Crear par de tokens JWT
    const tokenPair = createTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: [], // TODO: Obtener roles del usuario
    })

    // Almacenar refresh token en la base de datos
    const refreshTokenDecoded = decodeToken(tokenPair.refreshToken)
    if (refreshTokenDecoded && refreshTokenDecoded.exp) {
      await Database.storeRefreshToken({
        user_id: user.id,
        token_jti: refreshTokenDecoded.jti,
        expires_at: refreshTokenDecoded.exp, // Pasar como timestamp Unix
        user_agent: request.headers.get("user-agent") || undefined,
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      })
    }

    console.log("✅ Login completed for:", user.username)

    // Crear respuesta de redirección al dashboard
    const dashboardUrl = new URL(`https://${origin}/dashboard`)
    const response = NextResponse.redirect(dashboardUrl.toString())

    // Configurar cookies de autenticación
    response.cookies.set("access_token", tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutos
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
    })

    response.cookies.set("refresh_token", tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
    })

    // Limpiar cookies temporales de OAuth
    response.cookies.delete("oauth_token_secret")
    response.cookies.delete("oauth_origin")

    return response
  } catch (error) {
    console.error("❌ Callback error:", error)

    const origin = request.cookies.get("oauth_origin")?.value || "www.wikipeoplestats.org"
    const errorUrl = new URL(`https://${origin}/login`)
    errorUrl.searchParams.set("error", "oauth_failed")
    errorUrl.searchParams.set("message", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.redirect(errorUrl.toString())
  }
}
