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
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get("origin") || "www.wikipeoplestats.org"

    console.log("🔑 Initiating OAuth login for origin:", origin)

    const oauthClient = createOAuthClient()

    // Solicitar token de request
    const requestData = {
      url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/initiate`,
      method: "POST",
      data: {
        oauth_callback: `https://${process.env.AUTH_DOMAIN || origin}/api/auth/callback?origin=${encodeURIComponent(origin)}`,
      },
    }

    const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData))

    const response = await fetch(requestData.url, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "WikiPeopleStats/1.0",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ OAuth initiate failed:", errorText)
      throw new Error(`OAuth initiate failed: ${response.status}`)
    }

    const responseText = await response.text()
    const params = new URLSearchParams(responseText)

    const oauthToken = params.get("oauth_token")
    const oauthTokenSecret = params.get("oauth_token_secret")

    if (!oauthToken || !oauthTokenSecret) {
      throw new Error("Failed to get OAuth tokens from response")
    }

    console.log("✅ OAuth tokens obtained, redirecting to authorization")

    // Crear URL de autorización
    const authUrl = `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/authorize&oauth_token=${oauthToken}&oauth_consumer_key=${process.env.WIKIPEDIA_CLIENT_ID}`

    // Crear respuesta de redirección
    const redirectResponse = NextResponse.redirect(authUrl)

    // Guardar el token secret en una cookie segura
    redirectResponse.cookies.set("oauth_token_secret", oauthTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutos
      path: "/",
    })

    return redirectResponse
  } catch (error) {
    console.error("❌ Login initiation error:", error)

    const errorUrl = new URL(`https://${request.nextUrl.searchParams.get("origin") || "www.wikipeoplestats.org"}/login`)
    errorUrl.searchParams.set("error", "oauth_init_failed")
    errorUrl.searchParams.set("message", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.redirect(errorUrl.toString())
  }
}
