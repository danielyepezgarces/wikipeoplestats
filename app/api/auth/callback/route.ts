import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { Database } from "@/lib/database"
import { createTokenPair, decodeToken } from "@/lib/jwt"

const oauth = require("oauth-1.0a")

const WIKIMEDIA_OAUTH_URL = "https://meta.wikimedia.org/w/index.php"
const DEFAULT_ORIGIN = "www.wikipeoplestats.org"
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
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

function redirectToErrorPage(origin: string, errorType: string, errorMessage: string): NextResponse {
  const errorUrl = new URL(`https://${origin}/login`)
  errorUrl.searchParams.set("error", errorType)
  errorUrl.searchParams.set("message", errorMessage)

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

async function getUserIdentity(oauth_token: string, oauth_token_secret: string): Promise<any | null> {
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

    return decoded
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

/**
 * Handles the OAuth callback GET request.
 * Exchanges request token for access token, fetches user info,
 * creates or updates user in DB, creates session, and sets cookies.
 */
export async function GET(request: NextRequest) {
  console.log("🔄 Processing OAuth callback...")

  try {
    // Inicializar tablas si es necesario
    await Database.initializeTables()

    const searchParams = request.nextUrl.searchParams
    const oauthToken = searchParams.get("oauth_token")
    const oauthVerifier = searchParams.get("oauth_verifier")
    const origin = searchParams.get("origin") || DEFAULT_ORIGIN

    if (!oauthToken || !oauthVerifier) {
      throw new Error("Missing OAuth parameters")
    }

    // Get the stored secret from cookies
    const oauthSecret = request.cookies.get("oauth_token_secret")?.value
    if (!oauthSecret) {
      throw new Error("OAuth secret not found in cookies")
    }

    // Configure OAuth client
    const oauthClient = createOAuthClient()

    // Exchange for access token
    const requestData = {
      url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/token`,
      method: "POST",
      data: { oauth_token: oauthToken, oauth_verifier: oauthVerifier },
    }

    const token = {
      key: oauthToken,
      secret: oauthSecret,
    }

    const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData, token))

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
      throw new Error(`Token exchange failed: ${errorText}`)
    }

    const responseText = await response.text()
    const responseParams = new URLSearchParams(responseText)
    const accessToken = responseParams.get("oauth_token")
    const accessSecret = responseParams.get("oauth_token_secret")

    if (!accessToken || !accessSecret) {
      throw new Error("Failed to get access tokens")
    }

    // Get user info from Wikimedia
    const userInfoData = {
      url: "https://meta.wikimedia.org/w/api.php",
      method: "GET",
      data: {
        action: "query",
        meta: "userinfo",
        uiprop: "email|realname|registrationdate",
        format: "json",
      },
    }

    const userToken = {
      key: accessToken,
      secret: accessSecret,
    }

    const userAuthHeader = oauthClient.toHeader(oauthClient.authorize(userInfoData, userToken))

    const userResponse = await fetch(`${userInfoData.url}?${new URLSearchParams(userInfoData.data)}`, {
      headers: {
        ...userAuthHeader,
        "User-Agent": "WikiPeopleStats/1.0",
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to get user info")
    }

    const userData = await userResponse.json()
    const userInfo = userData.query.userinfo

    console.log("👤 User info obtained:", userInfo.name)

    // Find or create user in database
    let user = await Database.getUserByWikipediaId(userInfo.id.toString())

    if (!user) {
      // Check if user exists by username (unclaimed account)
      const existingUser = await Database.getUserByUsername(userInfo.name)

      if (existingUser && !existingUser.is_claimed) {
        // Claim existing account
        user = await Database.claimUserAccount(existingUser.id, userInfo.id.toString(), userInfo.email)
        console.log("✅ Account claimed for:", userInfo.name)
      } else {
        // Create new user
        user = await Database.createUser({
          wikimedia_id: userInfo.id.toString(),
          username: userInfo.name,
          email: userInfo.email,
          registration_date: userInfo.registrationdate,
          is_claimed: true,
        })

        if (user) {
          await Database.assignDefaultRole(user.id)
          console.log("✅ New user created:", userInfo.name)
        }
      }
    }

    if (!user) {
      throw new Error("Failed to process user")
    }

    // Update last login
    await Database.updateUserLogin(user.id)

    // Create token pair
    const tokenPair = createTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: [], // TODO: Get user roles
    })

    // Store refresh token
    const refreshTokenDecoded = decodeToken(tokenPair.refreshToken)
    if (refreshTokenDecoded) {
      await Database.storeRefreshToken({
        user_id: user.id,
        token_jti: refreshTokenDecoded.jti,
        expires_at: new Date(refreshTokenDecoded.exp * 1000).toISOString(),
        user_agent: request.headers.get("user-agent") || undefined,
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      })
    }

    // Redirect to origin with success
    const redirectUrl = new URL(`https://${origin}/dashboard`)
    const response_redirect = NextResponse.redirect(redirectUrl.toString())

    // Set secure cookies
    response_redirect.cookies.set("access_token", tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
    })

    response_redirect.cookies.set("refresh_token", tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
    })

    // Clear OAuth secret cookie
    response_redirect.cookies.delete("oauth_token_secret")

    console.log("✅ Login completed for:", user.username)

    return response_redirect
  } catch (error) {
    console.error("❌ Callback error:", error)

    const errorUrl = new URL(`https://${origin}/login`)
    errorUrl.searchParams.set("error", "oauth_failed")
    errorUrl.searchParams.set("message", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.redirect(errorUrl.toString())
  }
}
