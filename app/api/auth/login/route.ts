import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const oauth = require("oauth-1.0a")

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

    // Guardar estado para verificación CSRF
    redirectResponse.cookies.set("oauth_state", oauthToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutos
      path: "/",
    })

    return redirectResponse
  } catch (error) {
    console.error("❌ OAuth Error:", error)
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url))
  }
}
