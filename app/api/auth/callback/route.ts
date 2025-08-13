import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { Database } from "@/lib/database"
import { createTokenPair } from "@/lib/jwt"

const WIKIPEDIA_CLIENT_ID = process.env.WIKIPEDIA_CLIENT_ID
const WIKIPEDIA_CLIENT_SECRET = process.env.WIKIPEDIA_CLIENT_SECRET

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
    console.log("🔄 Processing OAuth callback...")

    const { searchParams } = new URL(request.url)
    const oauthToken = searchParams.get("oauth_token")
    const oauthVerifier = searchParams.get("oauth_verifier")

    if (!oauthToken || !oauthVerifier) {
      throw new Error("Missing OAuth parameters")
    }

    // Get stored token secret
    const cookieStore = cookies()
    const oauthTokenSecret = cookieStore.get("oauth_token_secret")?.value
    const origin = cookieStore.get("origin")?.value || "/dashboard"

    if (!oauthTokenSecret) {
      throw new Error("Missing OAuth token secret")
    }

    console.log("🔐 Token secret found in cookies")

    // Exchange for access token
    const accessTokenUrl = "https://meta.wikimedia.org/w/index.php?title=Special:OAuth/token"

    const oauthParams = {
      oauth_consumer_key: WIKIPEDIA_CLIENT_ID!,
      oauth_nonce: crypto.randomBytes(16).toString("hex"),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: oauthToken,
      oauth_verifier: oauthVerifier,
      oauth_version: "1.0",
    }

    // Generate signature
    const signature = generateOAuthSignature(
      "POST",
      accessTokenUrl,
      oauthParams,
      WIKIPEDIA_CLIENT_SECRET!,
      oauthTokenSecret,
    )
    oauthParams.oauth_signature = signature

    // Create authorization header
    const authHeader = `OAuth ${Object.entries(oauthParams)
      .map(([key, value]) => `${key}="${encodeURIComponent(value)}"`)
      .join(", ")}`

    console.log("📤 Requesting access token...")

    // Request access token
    const tokenResponse = await fetch(accessTokenUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    const tokenResponseText = await tokenResponse.text()
    console.log("📄 Access token response:", tokenResponseText)

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponseText}`)
    }

    // Parse access token response
    const tokenParams = new URLSearchParams(tokenResponseText)
    const accessToken = tokenParams.get("oauth_token")
    const accessTokenSecret = tokenParams.get("oauth_token_secret")

    if (!accessToken || !accessTokenSecret) {
      throw new Error("Failed to get OAuth tokens from response")
    }

    console.log("✅ Final OAuth tokens obtained")

    // Get user information using identify endpoint
    console.log("👤 Getting user information...")
    const identifyUrl = "https://meta.wikimedia.org/w/index.php?title=Special:OAuth/identify"

    const identifyParams = {
      oauth_consumer_key: WIKIPEDIA_CLIENT_ID!,
      oauth_nonce: crypto.randomBytes(16).toString("hex"),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: accessToken,
      oauth_version: "1.0",
    }

    // Generate signature for identify request
    const identifySignature = generateOAuthSignature(
      "GET",
      identifyUrl,
      identifyParams,
      WIKIPEDIA_CLIENT_SECRET!,
      accessTokenSecret,
    )
    identifyParams.oauth_signature = identifySignature

    // Create authorization header for identify
    const identifyAuthHeader = `OAuth ${Object.entries(identifyParams)
      .map(([key, value]) => `${key}="${encodeURIComponent(value)}"`)
      .join(", ")}`

    // Make identify request
    const userResponse = await fetch(identifyUrl, {
      method: "GET",
      headers: {
        Authorization: identifyAuthHeader,
      },
    })

    if (!userResponse.ok) {
      throw new Error(`Failed to get user info: ${userResponse.status} ${userResponse.statusText}`)
    }

    // The identify endpoint returns a JWT, not JSON
    const userJWT = await userResponse.text()
    console.log("📊 User JWT received:", userJWT.substring(0, 50) + "...")

    // Decode the JWT (it's not signed by us, so we just decode it)
    const jwtParts = userJWT.split(".")
    if (jwtParts.length !== 3) {
      throw new Error("Invalid JWT format from identify endpoint")
    }

    const payload = JSON.parse(Buffer.from(jwtParts[1], "base64").toString())
    console.log("👤 User info decoded:", payload)

    if (!payload.sub || !payload.username) {
      throw new Error("Invalid user data in JWT")
    }

    const wikimediaId = payload.sub.toString()
    const username = payload.username
    const email = payload.email || null

    // Check if user exists
    let user = await Database.getUserByWikipediaId(wikimediaId)

    if (user) {
      console.log("👤 User found, updating...")
      // Update user login time
      await Database.updateUserLogin(user.id)
    } else {
      console.log("👤 Creating new user...")
      // Create new user
      user = await Database.createUser({
        wikimedia_id: wikimediaId,
        username: username,
        email: email,
        registration_date: payload.registered || null,
        is_claimed: true,
      })

      if (user) {
        await Database.assignDefaultRole(user.id)
      }
    }

    if (!user) {
      throw new Error("Failed to create or retrieve user")
    }

    // Create JWT tokens
    const tokens = createTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: ["user"], // Get from database in real implementation
    })

    // Store refresh token
    await Database.storeRefreshToken({
      user_id: user.id,
      token_jti: tokens.refreshJti,
      expires_at: tokens.refreshTokenExpiry,
      user_agent: request.headers.get("user-agent") || undefined,
      ip_address: request.ip || undefined,
    })

    console.log("✅ Login successful for user:", user.username)

    // Redirect to dashboard with tokens
    const redirectResponse = NextResponse.redirect(new URL(origin, request.url))

    // Set secure cookies
    redirectResponse.cookies.set("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
    })

    redirectResponse.cookies.set("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    // Clean up temporary cookies
    redirectResponse.cookies.delete("oauth_token_secret")
    redirectResponse.cookies.delete("origin")

    return redirectResponse
  } catch (error) {
    console.error("❌ Callback error:", error)

    const cookieStore = cookies()
    const origin = cookieStore.get("origin")?.value || "/login"

    const errorUrl = new URL(origin, request.url)
    errorUrl.searchParams.set("error", "oauth_failed")
    errorUrl.searchParams.set("message", error instanceof Error ? error.message : "Unknown error")

    const response = NextResponse.redirect(errorUrl.toString())
    response.cookies.delete("oauth_token_secret")
    response.cookies.delete("origin")

    return response
  }
}
