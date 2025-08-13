import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { createAuthSession } from "@/lib/auth-middleware"

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
      // Simple hash function for server-side use
      let hash = 0
      const input = base_string + key
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash
      }
      return Math.abs(hash).toString(16)
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

// Simple base64 decode function
function base64Decode(str: string): string {
  try {
    // Add padding if needed
    const padding = str.length % 4
    if (padding) {
      str += "=".repeat(4 - padding)
    }

    // Replace URL-safe characters
    str = str.replace(/-/g, "+").replace(/_/g, "/")

    return atob(str)
  } catch (error) {
    console.error("Base64 decode error:", error)
    return ""
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
    console.log("🔍 JWT response:", jwtEncoded.substring(0, 100) + "...")

    // Manual JWT decode without verification (since it's from Wikimedia)
    const parts = jwtEncoded.split(".")
    if (parts.length !== 3) {
      console.error("❌ Invalid JWT format, parts:", parts.length)
      return null
    }

    try {
      const payloadDecoded = base64Decode(parts[1])
      console.log("🔍 Decoded payload:", payloadDecoded.substring(0, 200) + "...")

      const payload = JSON.parse(payloadDecoded)
      console.log("🔍 Parsed payload:", {
        sub: payload.sub,
        username: payload.username,
        email: payload.email,
        editcount: payload.editcount,
      })

      if (!payload || !payload.sub || !payload.username) {
        console.error("❌ Missing required fields in payload")
        return null
      }

      return {
        id: payload.sub,
        username: payload.username,
        email: payload.email || null,
        editCount: payload.editcount || 0,
        registrationDate: payload.registration || "",
      }
    } catch (parseError) {
      console.error("❌ Error parsing JWT payload:", parseError)
      return null
    }
  } catch (error) {
    console.error("❌ Error in getUserIdentity:", error)
    return null
  }
}

function createAuthResponse(origin: string, token: string, userData: any): NextResponse {
  const maxAge = 30 * 24 * 60 * 60
  const response = NextResponse.redirect(`https://${origin}/dashboard`)

  response.cookies.set("auth_token", token, {
    domain: COOKIE_DOMAIN,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge,
  })

  response.cookies.set("user_info", JSON.stringify(userData), {
    domain: COOKIE_DOMAIN,
    path: "/",
    secure: true,
    sameSite: "lax",
    maxAge,
  })

  return response
}

export async function GET(request: NextRequest) {
  try {
    // Initialize database tables
    await Database.initializeTables()

    const searchParams = request.nextUrl.searchParams
    const oauth_token = searchParams.get("oauth_token")
    const oauth_verifier = searchParams.get("oauth_verifier")
    const origin = searchParams.get("origin") || DEFAULT_ORIGIN

    if (!oauth_token || !oauth_verifier) {
      return redirectToErrorPage(origin, "missing_parameters")
    }

    const oauth_token_secret = request.cookies.get("oauth_token_secret")?.value
    if (!oauth_token_secret) {
      return redirectToErrorPage(origin, "session_expired")
    }

    console.log("🔑 Getting access token...")
    const accessToken = await getAccessToken(oauth_token, oauth_token_secret, oauth_verifier)
    if (!accessToken) return redirectToErrorPage(origin, "token_exchange_failed")

    console.log("👤 Getting user info...")
    const userInfo = await getUserIdentity(accessToken.oauth_token, accessToken.oauth_token_secret)
    if (!userInfo) return redirectToErrorPage(origin, "user_info_failed")

    console.log("🔍 Looking for existing user...")
    let user = await Database.getUserByWikipediaId(userInfo.id)

    if (!user) {
      // Look for unclaimed account by username
      const unclaimedUser = await Database.getUserByUsername(userInfo.username)

      if (unclaimedUser && !unclaimedUser.is_claimed && !unclaimedUser.wikimedia_id) {
        console.log("🔗 Claiming existing unclaimed account...")
        user = await Database.claimUserAccount(unclaimedUser.id, userInfo.id, userInfo.email || undefined)
        if (!user) {
          return redirectToErrorPage(origin, "account_claim_failed")
        }
      } else {
        console.log("🆕 Creating new user...")
        user = await Database.createUser({
          wikimedia_id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email || undefined,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.username)}&background=random&color=fff&rounded=true&size=150`,
          registration_date: userInfo.registrationDate || undefined,
          is_claimed: true,
        })
      }
    } else if (!user.is_claimed) {
      console.log("🔗 Claiming existing account...")
      user = await Database.claimUserAccount(user.id, userInfo.id, userInfo.email || undefined)
      if (!user) {
        return redirectToErrorPage(origin, "account_claim_failed")
      }
    }

    console.log("🕓 Updating last login...")
    await Database.updateUserLogin(user.id)

    console.log("🔐 Creating session...")
    const userAgent = request.headers.get("user-agent") || ""
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined

    const { token } = await createAuthSession(user.id, origin, userAgent, ipAddress)

    console.log("✅ Auth successful. Redirecting...")
    return createAuthResponse(origin, token, {
      id: user.id,
      username: user.username,
      email: user.email,
      is_claimed: user.is_claimed,
    })
  } catch (error: unknown) {
    console.error("🔥 Unhandled error in auth callback:", error)
    const message = error instanceof Error ? error.message : String(error)
    return new NextResponse(`Internal Server Error: ${message}`, { status: 500 })
  }
}
