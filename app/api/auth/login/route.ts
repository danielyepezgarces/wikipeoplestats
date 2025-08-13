import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { createTokenPair } from "@/lib/jwt"
import { cookies } from "next/headers"
import crypto from "crypto"
import oauth from "oauth-1.0a"

export async function GET(request: NextRequest) {
  console.log("🔍 Starting Wikimedia OAuth login...")

  try {
    // Verify environment variables first
    if (!process.env.WIKIPEDIA_CLIENT_ID || !process.env.WIKIPEDIA_CLIENT_SECRET) {
      throw new Error("Missing Wikipedia OAuth credentials in environment variables")
    }

    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get("origin") || request.headers.get("referer") || "www.wikipeoplestats.org"
    const realCallback = `${process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.wikipeoplestats.org"}/api/auth/callback?origin=${encodeURIComponent(origin)}`

    // Configure OAuth 1.0a client
    const oauthClient = oauth({
      consumer: {
        key: process.env.WIKIPEDIA_CLIENT_ID,
        secret: process.env.WIKIPEDIA_CLIENT_SECRET,
      },
      signature_method: "HMAC-SHA1",
      hash_function: (base_string: string, key: string) => {
        return crypto.createHmac("sha1", key).update(base_string).digest("base64")
      },
    })

    const requestData = {
      url: "https://meta.wikimedia.org/w/index.php?title=Special:OAuth/initiate",
      method: "POST",
      data: { oauth_callback: "oob" }, // Wikimedia requires 'oob'
    }

    // Generate authorization header
    const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData))

    // Add important headers
    const headers = {
      ...authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "WikiPeopleStats/1.0",
      Accept: "application/json",
    }

    console.log("📋 Request headers:", headers)

    // Make the request using fetch instead of axios for better control
    const response = await fetch(requestData.url, {
      method: "POST",
      headers,
      body: new URLSearchParams(requestData.data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OAuth request failed with status ${response.status}: ${errorText}`)
    }

    const responseText = await response.text()
    console.log("🔧 Raw response:", responseText)

    // Parse the response
    const responseParams = new URLSearchParams(responseText)
    const oauthToken = responseParams.get("oauth_token")
    const oauthSecret = responseParams.get("oauth_token_secret")
    const callbackConfirmed = responseParams.get("oauth_callback_confirmed")

    if (!oauthToken || !oauthSecret || callbackConfirmed !== "true") {
      throw new Error(`Invalid OAuth response: ${responseText}`)
    }

    console.log("✅ Tokens obtained successfully")

    // Build authorization URL with our real callback as a parameter
    const authUrl = new URL("https://meta.wikimedia.org/wiki/Special:OAuth/authorize")
    authUrl.searchParams.set("oauth_token", oauthToken)
    authUrl.searchParams.set("wikipeoplestats_callback", realCallback)

    const redirectResponse = NextResponse.redirect(authUrl.toString())

    // Store the secret securely
    redirectResponse.cookies.set("oauth_token_secret", oauthSecret, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 300, // 5 minutes
    })

    return redirectResponse
  } catch (error) {
    console.error("❌ OAuth Error:", error)
    return NextResponse.json(
      {
        error: "OAuth initialization failed",
        details: error instanceof Error ? error.message : String(error),
        suggestion: "Please verify your OAuth consumer key and secret, and ensure your server clock is synchronized",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  console.log("🔍 Procesando login...")

  try {
    const { code, state } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Código de autorización requerido" }, { status: 400 })
    }

    // Intercambiar código por token de acceso de Wikipedia
    const tokenResponse = await fetch("https://meta.wikimedia.org/w/rest.php/oauth2/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "WikiPeopleStats/1.0",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.WIKIPEDIA_CLIENT_ID!,
        client_secret: process.env.WIKIPEDIA_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: "Error obteniendo token de acceso" }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()

    // Obtener información del usuario de Wikipedia
    const userResponse = await fetch("https://meta.wikimedia.org/w/api.php", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "WikiPeopleStats/1.0",
      },
      body: new URLSearchParams({
        action: "query",
        meta: "userinfo",
        uiprop: "email|realname|registrationdate",
        format: "json",
      }),
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Error obteniendo información del usuario" }, { status: 400 })
    }

    const userData = await userResponse.json()
    const userInfo = userData.query.userinfo

    // Buscar o crear usuario en la base de datos
    let user = await Database.getUserByWikipediaId(userInfo.id.toString())

    if (!user) {
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
      // Actualizar información del usuario existente
      if (!user.is_claimed) {
        user = await Database.claimUserAccount(user.id, userInfo.id.toString(), userInfo.email)
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Error procesando usuario" }, { status: 500 })
    }

    // Actualizar último login
    await Database.updateUserLogin(user.id)

    // Crear par de tokens
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
      token_jti: tokenPair.refreshToken, // Necesitamos extraer el JTI del token
      expires_at: new Date(tokenPair.refreshTokenExpiry * 1000).toISOString(),
      user_agent: userAgent,
      ip_address: ipAddress,
    })

    // Configurar cookies
    const cookieStore = await cookies()
    const response = NextResponse.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        is_claimed: user.is_claimed,
      },
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
        tokenType: "Bearer",
      },
    })

    // Access token cookie (corta duración)
    response.cookies.set("access_token", tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutos
      path: "/",
    })

    // Refresh token cookie (larga duración)
    response.cookies.set("refresh_token", tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    })

    console.log("✅ Login completado para:", user.username)

    return response
  } catch (error) {
    console.error("❌ Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
