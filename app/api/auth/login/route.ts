import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const oauth = require("oauth-1.0a")

const WIKIMEDIA_OAUTH_URL = "https://meta.wikimedia.org/w/index.php"

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
    console.log("🔑 Starting OAuth login process...")

    // Verificar variables de entorno
    if (!process.env.WIKIPEDIA_CLIENT_ID || !process.env.WIKIPEDIA_CLIENT_SECRET) {
      console.error("❌ Missing Wikipedia OAuth credentials")
      throw new Error("Missing Wikipedia OAuth credentials")
    }

    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get("origin") || "www.wikipeoplestats.org"

    console.log("🌐 Origin:", origin)
    console.log("🔑 Client ID:", process.env.WIKIPEDIA_CLIENT_ID?.substring(0, 8) + "...")

    const oauthClient = createOAuthClient()

    // Preparar datos para la solicitud de token de request
    const requestData = {
      url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/initiate`,
      method: "POST",
      data: {
        oauth_callback: "oob", // Wikimedia requiere 'oob' (out-of-band)
      },
    }

    console.log("📤 Making OAuth initiate request to:", requestData.url)

    // Generar header de autorización
    const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData))

    console.log("🔐 Auth header generated:", JSON.stringify(authHeader, null, 2))

    // Hacer la solicitud
    const response = await fetch(requestData.url, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "WikiPeopleStats/1.0",
      },
      body: new URLSearchParams(requestData.data),
    })

    console.log("📥 Response status:", response.status)
    console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ OAuth initiate failed:", errorText)
      throw new Error(`OAuth initiate failed: ${response.status} - ${errorText}`)
    }

    const responseText = await response.text()
    console.log("📄 Response text:", responseText)

    // Parsear la respuesta
    const params = new URLSearchParams(responseText)
    const oauthToken = params.get("oauth_token")
    const oauthTokenSecret = params.get("oauth_token_secret")
    const callbackConfirmed = params.get("oauth_callback_confirmed")

    console.log("🔍 Parsed params:")
    console.log("  - oauth_token:", oauthToken ? oauthToken.substring(0, 8) + "..." : "missing")
    console.log("  - oauth_token_secret:", oauthTokenSecret ? "present" : "missing")
    console.log("  - callback_confirmed:", callbackConfirmed)

    if (!oauthToken || !oauthTokenSecret) {
      console.error("❌ Missing tokens in response")
      console.error("Full response:", responseText)
      throw new Error(`Failed to get OAuth tokens from response. Token: ${!!oauthToken}, Secret: ${!!oauthTokenSecret}`)
    }

    if (callbackConfirmed !== "true") {
      console.error("❌ Callback not confirmed")
      throw new Error(`OAuth callback not confirmed: ${callbackConfirmed}`)
    }

    console.log("✅ OAuth tokens obtained successfully")

    // Construir URL de autorización
    const authUrl = new URL(`${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/authorize`)
    authUrl.searchParams.set("oauth_token", oauthToken)
    authUrl.searchParams.set("oauth_consumer_key", process.env.WIKIPEDIA_CLIENT_ID)

    console.log("🔗 Authorization URL:", authUrl.toString())

    // Crear respuesta de redirección
    const redirectResponse = NextResponse.redirect(authUrl.toString())

    // Guardar el token secret en una cookie segura
    redirectResponse.cookies.set("oauth_token_secret", oauthTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutos
      path: "/",
    })

    // Guardar el origin para el callback
    redirectResponse.cookies.set("oauth_origin", origin, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutos
      path: "/",
    })

    console.log("🚀 Redirecting to Wikipedia authorization...")

    return redirectResponse
  } catch (error) {
    console.error("❌ Login initiation error:", error)

    const origin = request.nextUrl.searchParams.get("origin") || "www.wikipeoplestats.org"
    const errorUrl = new URL(`https://${origin}/login`)
    errorUrl.searchParams.set("error", "oauth_init_failed")
    errorUrl.searchParams.set("message", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.redirect(errorUrl.toString())
  }
}
