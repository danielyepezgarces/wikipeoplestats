import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import jwt from "jsonwebtoken"
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

async function getAccessToken(
  oauth_token: string,
  oauth_token_secret: string,
  oauth_verifier: string,
): Promise<{ oauth_token: string; oauth_token_secret: string } | null> {
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
    console.log("🔄 Exchanging request token for access token...")

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
      console.error("❌ Token exchange failed:", errorText)
      return null
    }

    const text = await response.text()
    console.log("📄 Token exchange response:", text)

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
    console.log("👤 Getting user identity...")

    const response = await fetch(requestData.url, {
      method: "POST",
      headers: {
        ...authHeader,
        "User-Agent": "WikiPeopleStats/1.0",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Failed to get user identity:", errorText)
      return null
    }

    const jwtEncoded = await response.text()
    console.log("🔐 Received JWT from Wikipedia")

    const decoded: any = jwt.decode(jwtEncoded)

    if (!decoded || !decoded.sub || !decoded.username) {
      console.error("❌ Invalid JWT payload:", decoded)
      return null
    }

    console.log("✅ User identity decoded:", {
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email || null,
    })

    return {
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email || null,
      editCount: decoded.editcount || 0,
      registrationDate: decoded.registration || "",
    }
  } catch (error) {
    console.error("❌ Error in getUserIdentity:", error)
    return null
  }
}

/**
 * Handles the OAuth callback GET request.
 * Exchanges request token for access token, fetches user info,
 * creates or updates user in DB, creates session, and sets cookies.
 */
export async function GET(request: NextRequest) {
  console.log("🔄 Processing OAuth callback...")

  const searchParams = request.nextUrl.searchParams
  const oauth_token = searchParams.get("oauth_token")
  const oauth_verifier = searchParams.get("oauth_verifier")

  // Get origin from cookie or use default
  const origin = request.cookies.get("oauth_origin")?.value || DEFAULT_ORIGIN

  try {
    // Inicializar tablas si es necesario
    await Database.initializeTables()

    console.log("📋 Callback parameters:")
    console.log("  - oauth_token:", oauth_token ? oauth_token.substring(0, 8) + "..." : "missing")
    console.log("  - oauth_verifier:", oauth_verifier ? oauth_verifier.substring(0, 8) + "..." : "missing")
    console.log("  - origin:", origin)

    if (!oauth_token || !oauth_verifier) {
      throw new Error("Missing required OAuth parameters")
    }

    const oauth_token_secret = request.cookies.get("oauth_token_secret")?.value
    if (!oauth_token_secret) {
      throw new Error("OAuth token secret not found in cookies - session may have expired")
    }

    console.log("🔑 Getting access token...")
    const accessToken = await getAccessToken(oauth_token, oauth_token_secret, oauth_verifier)
    if (!accessToken) throw new Error("Failed to exchange tokens with Wikipedia")

    console.log("👤 Getting user info...")
    const userInfo = await getUserIdentity(accessToken.oauth_token, accessToken.oauth_token_secret)
    if (!userInfo) throw new Error("Failed to get user info from Wikipedia")

    console.log("🔍 Looking for existing user...")
    let user = await Database.getUserByWikipediaId(userInfo.id)

    if (!user) {
      // Buscar por nombre de usuario en caso de cuenta no reclamada
      const unclaimedUser = await Database.getUserByUsername(userInfo.username)

      if (unclaimedUser && !unclaimedUser.is_claimed && !unclaimedUser.wikimedia_id) {
        console.log("🔗 Claiming existing unclaimed account...")
        user = await Database.claimUserAccount(unclaimedUser.id, userInfo.id, userInfo.email || undefined)
        if (!user) {
          throw new Error("Failed to claim existing account")
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

        if (user) {
          await Database.assignDefaultRole(user.id)
        }
      }
    } else if (!user.is_claimed) {
      // Usuario existe pero no está reclamado, reclamarlo
      console.log("🔗 Claiming existing account...")
      user = await Database.claimUserAccount(user.id, userInfo.id, userInfo.email || undefined)
      if (!user) {
        throw new Error("Failed to claim existing account")
      }
    }

    if (!user) {
      throw new Error("Failed to create or update user")
    }

    console.log("🕓 Updating last login...")
    await Database.updateUserLogin(user.id)

    console.log("🔐 Creating token pair...")
    const tokenPair = createTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email || null,
      roles: [], // TODO: Get user roles
    })

    // Store refresh token
    const refreshTokenDecoded = decodeToken(tokenPair.refreshToken)
    if (refreshTokenDecoded) {
      await Database.storeRefreshToken({
        user_id: user.id,
        token_jti: refreshTokenDecoded.jti,
        expires_at: new Date(refreshTokenDecoded.exp! * 1000).toISOString(),
        user_agent: request.headers.get("user-agent") || undefined,
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      })
    }

    console.log("✅ Auth successful. Redirecting to:", `https://${origin}/dashboard`)
    const response = NextResponse.redirect(`https://${origin}/dashboard`)

    // Set secure cookies
    response.cookies.set("access_token", tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
    })

    response.cookies.set("refresh_token", tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
    })

    // Clear OAuth cookies
    response.cookies.delete("oauth_token_secret")
    response.cookies.delete("oauth_origin")

    return response
  } catch (error: unknown) {
    console.error("🔥 Callback error:", error)

    const errorUrl = new URL(`https://${origin}/login`)
    errorUrl.searchParams.set("error", "authentication_failed")
    errorUrl.searchParams.set("message", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.redirect(errorUrl.toString())
  }
}
