import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

const WIKIPEDIA_CLIENT_ID = process.env.WIKIPEDIA_CLIENT_ID
const WIKIPEDIA_CLIENT_SECRET = process.env.WIKIPEDIA_CLIENT_SECRET
const CALLBACK_URL = `${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/callback`

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret = "",
) {
  // Sort parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&")

  // Create signature base string
  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`

  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`

  // Generate signature
  const signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64")

  return signature
}

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 Starting OAuth login process...")

    if (!WIKIPEDIA_CLIENT_ID || !WIKIPEDIA_CLIENT_SECRET) {
      console.error("❌ Missing OAuth credentials")
      return NextResponse.json({ error: "OAuth credentials not configured" }, { status: 500 })
    }

    const requestTokenUrl = "https://meta.wikimedia.org/w/index.php?title=Special:OAuth/initiate"

    // OAuth 1.0a parameters
    const oauthParams = {
      oauth_callback: CALLBACK_URL,
      oauth_consumer_key: WIKIPEDIA_CLIENT_ID,
      oauth_nonce: crypto.randomBytes(16).toString("hex"),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: "1.0",
    }

    // Generate signature
    const signature = generateOAuthSignature("POST", requestTokenUrl, oauthParams, WIKIPEDIA_CLIENT_SECRET)
    oauthParams.oauth_signature = signature

    // Create authorization header
    const authHeader = `OAuth ${Object.entries(oauthParams)
      .map(([key, value]) => `${key}="${encodeURIComponent(value)}"`)
      .join(", ")}`

    console.log("📤 Requesting OAuth token...")

    // Request token
    const response = await fetch(requestTokenUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    const responseText = await response.text()
    console.log("📄 Request token response:", responseText)

    if (!response.ok) {
      throw new Error(`Failed to get request token: ${responseText}`)
    }

    // Parse response
    const params = new URLSearchParams(responseText)
    const oauthToken = params.get("oauth_token")
    const oauthTokenSecret = params.get("oauth_token_secret")
    const oauthCallbackConfirmed = params.get("oauth_callback_confirmed")

    if (!oauthToken || !oauthTokenSecret || oauthCallbackConfirmed !== "true") {
      throw new Error("Invalid request token response")
    }

    console.log("✅ Request token obtained:", oauthToken)

    // Store token secret in cookies for callback
    const cookieStore = cookies()
    const redirectResponse = NextResponse.redirect(
      `https://meta.wikimedia.org/wiki/Special:OAuth/authorize?oauth_token=${oauthToken}&oauth_consumer_key=${WIKIPEDIA_CLIENT_ID}`,
    )

    redirectResponse.cookies.set("oauth_token_secret", oauthTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutes
    })

    redirectResponse.cookies.set("origin", request.headers.get("referer") || "/dashboard", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutes
    })

    return redirectResponse
  } catch (error) {
    console.error("❌ Login error:", error)
    const errorUrl = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/login`)
    errorUrl.searchParams.set("error", "oauth_failed")
    errorUrl.searchParams.set("message", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.redirect(errorUrl.toString())
  }
}
