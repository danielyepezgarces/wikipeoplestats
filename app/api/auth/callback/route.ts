import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { SessionManager } from "@/lib/session-manager"
import { exchangeCodeForToken, getWikipediaUserInfo } from "@/lib/oauth"

const DEFAULT_ORIGIN = "www.wikipeoplestats.org"
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ".wikipeoplestats.org"

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
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari"
  else if (ua.includes("edge")) browser = "Edge"

  // Detectar OS
  if (ua.includes("windows")) os = "Windows"
  else if (ua.includes("mac")) os = "macOS"
  else if (ua.includes("linux")) os = "Linux"
  else if (ua.includes("android")) os = "Android"
  else if (ua.includes("ios")) os = "iOS"

  return `${device} - ${browser} on ${os}`
}

function createAuthResponse(origin: string, sessionId: string, userData: any): NextResponse {
  const maxAge = 30 * 24 * 60 * 60 // 30 días en segundos
  const response = NextResponse.redirect(`https://${origin}/dashboard`)

  // Usar session ID compacto
  response.cookies.set("session_id", sessionId, {
    domain: COOKIE_DOMAIN,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
  })

  // Información básica del usuario (no sensible)
  response.cookies.set(
    "user_info",
    JSON.stringify({
      id: userData.id,
      username: userData.username,
      is_claimed: userData.is_claimed,
    }),
    {
      domain: COOKIE_DOMAIN,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
    },
  )

  return response
}

export async function GET(request: NextRequest) {
  try {
    // Inicializar tablas si es necesario
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
    const accessToken = await exchangeCodeForToken(oauth_token, oauth_token_secret, oauth_verifier)
    if (!accessToken) return redirectToErrorPage(origin, "token_exchange_failed")

    console.log("👤 Getting user info...")
    const userInfo = await getWikipediaUserInfo(accessToken.oauth_token, accessToken.oauth_token_secret)
    if (!userInfo) return redirectToErrorPage(origin, "user_info_failed")

    console.log("🔍 Looking for existing user...")
    let user = await Database.getUserByWikipediaId(userInfo.sub)

    if (!user) {
      // Buscar por nombre de usuario en caso de cuenta no reclamada
      const unclaimedUser = await Database.getUserByUsername(userInfo.username)

      if (unclaimedUser && !unclaimedUser.is_claimed && !unclaimedUser.wikimedia_id) {
        console.log("🔗 Claiming existing unclaimed account...")
        user = await Database.claimUserAccount(unclaimedUser.id, userInfo.sub, userInfo.email)
        if (!user) {
          return redirectToErrorPage(origin, "account_claim_failed")
        }
      } else {
        console.log("🆕 Creating new user...")
        user = await Database.createUser({
          wikimedia_id: userInfo.sub,
          username: userInfo.username,
          email: userInfo.email,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.username)}&background=random&color=fff&rounded=true&size=150`,
          registration_date: userInfo.registration,
          is_claimed: true,
        })

        if (user) {
          await Database.assignDefaultRole(user.id)
        }
      }
    } else if (!user.is_claimed) {
      // Usuario existe pero no está reclamado, reclamarlo
      console.log("🔗 Claiming existing account...")
      user = await Database.claimUserAccount(user.id, userInfo.sub, userInfo.email)
      if (!user) {
        return redirectToErrorPage(origin, "account_claim_failed")
      }
    }

    if (!user) {
      return redirectToErrorPage(origin, "authentication_failed")
    }

    console.log("🕓 Updating last login...")
    await Database.updateUserLogin(user.id)

    console.log("🔐 Creating compact server session...")
    const userAgent = request.headers.get("user-agent") || ""
    const deviceInfo = getDeviceInfo(userAgent)
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined

    // Crear sesión del servidor con ID compacto
    const sessionId = await SessionManager.createSession(user, {
      origin,
      userAgent,
      ipAddress,
      deviceInfo,
    })

    console.log("✅ Auth successful. Redirecting...")
    return createAuthResponse(origin, sessionId, {
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
