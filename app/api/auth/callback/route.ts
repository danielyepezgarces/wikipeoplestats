import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { createTokenPair } from "@/lib/jwt"
import crypto from "crypto"

const oauth = require("oauth-1.0a")

const WIKIMEDIA_OAUTH_URL = "https://meta.wikimedia.org/w/index.php"
const WIKIMEDIA_API_URL = "https://meta.wikimedia.org/w/api.php"

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
  try {
    console.log("🔄 Processing OAuth callback...")

    const searchParams = request.nextUrl.searchParams
    const oauthToken = searchParams.get("oauth_token")
    const oauthVerifier = searchParams.get("oauth_verifier")
    const origin = request.cookies.get("oauth_origin")?.value || "www.wikipeoplestats.org"

    console.log("📋 Callback params:")
    console.log("  - oauth_token:", oauthToken?.substring(0, 8) + "...")
    console.log("  - oauth_verifier:", oauthVerifier?.substring(0, 8) + "...")
    console.log("  - origin:", origin)

    if (!oauthToken || !oauthVerifier) {
      throw new Error("Missing OAuth parameters")
    }

    const oauthTokenSecret = request.cookies.get("oauth_token_secret")?.value
    if (!oauthTokenSecret) {
      throw new Error("Missing OAuth token secret")
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

    const authHeader = oauthClient.toHeader(oauthClient.authorize(accessTokenData, token))

    console.log("📤 Requesting access token...")

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

    const accessTokenParams = new URLSearchParams(accessTokenText)
    const finalOauthToken = accessTokenParams.get("oauth_token")
    const finalOauthTokenSecret = accessTokenParams.get("oauth_token_secret")

    if (!finalOauthToken || !finalOauthTokenSecret) {
      throw new Error("Failed to get final OAuth tokens")
    }

    console.log("✅ Final OAuth tokens obtained")

    // Obtener información del usuario usando identify
    const identifyData = {
      url: `${WIKIMEDIA_API_URL}?action=query&meta=userinfo&uiprop=id|name|email|realname|registrationdate&format=json`,
      method: "GET",
    }

    const finalToken = {
      key: finalOauthToken,
      secret: finalOauthTokenSecret,
    }

    const identifyAuthHeader = oauthClient.toHeader(oauthClient.authorize(identifyData, finalToken))

    console.log("👤 Getting user information...")

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
    console.log("📊 User data received:", JSON.stringify(userData, null, 2))

    if (!userData.query || !userData.query.userinfo) {
      throw new Error("Invalid user data response")
    }

    const userInfo = userData.query.userinfo

    console.log("👤 User info obtained:", userInfo.name)

    // Buscar o crear usuario en la base de datos
    let user = await Database.getUserByWikipediaId(userInfo.id.toString())

    if (!user) {
      console.log("👤 Creating new user...")
      // Crear nuevo usuario
      user = await Database.createUser({
        wikimedia_id: userInfo.id.toString(),
        username: userInfo.name,
        email: userInfo.email,
        registration_date: userInfo.registrationdate,
        is_claimed: true,
      })

      // Asignar rol por defecto
      await Database.assignDefaultRole(user.id)
    } else {
      console.log("👤 User found, updating...")
      // Actualizar información del usuario existente
      if (!user.is_claimed) {
        user = await Database.claimUserAccount(user.id, userInfo.id.toString(), userInfo.email)
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
    const userAgent = request.headers.get("user-agent") || undefined
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined

    await Database.storeRefreshToken({
      user_id: user.id,
      token_jti: tokenPair.refreshJti,
      expires_at: tokenPair.refreshTokenExpiry,
      user_agent: userAgent,
      ip_address: ipAddress,
    })

    console.log("✅ Login completed for:", user.username)

    // Crear URL de redirección
    const redirectUrl = new URL(`https://${origin}/dashboard`)
    const redirectResponse = NextResponse.redirect(redirectUrl.toString())

    // Configurar cookies
    redirectResponse.cookies.set("access_token", tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutos
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
    })

    redirectResponse.cookies.set("refresh_token", tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
    })

    // Limpiar cookies temporales
    redirectResponse.cookies.delete("oauth_token_secret")
    redirectResponse.cookies.delete("oauth_origin")

    return redirectResponse
  } catch (error) {
    console.error("❌ Callback error:", error)

    const origin = request.cookies.get("oauth_origin")?.value || "www.wikipeoplestats.org"
    const errorUrl = new URL(`https://${origin}/login`)
    errorUrl.searchParams.set("error", "oauth_failed")
    errorUrl.searchParams.set("message", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.redirect(errorUrl.toString())
  }
}
