import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { Database } from "@/lib/database"
import { createTokenPair, verifyToken } from "@/lib/jwt"
import { setCorsHeaders, handleCorsOptions } from "@/lib/cors"

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request)
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

    console.log("🔄 Token refresh request:", {
      hasRefreshToken: !!refreshToken,
      refreshTokenPreview: refreshToken?.substring(0, 20) + "..." || "none",
    })

    if (!refreshToken) {
      console.log("❌ No refresh token provided")
      const response = NextResponse.json({ error: "No refresh token provided" }, { status: 401 })
      return setCorsHeaders(response, request.headers.get("origin"))
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken)
    if (!decoded || decoded.type !== "refresh") {
      console.log("❌ Invalid refresh token:", { decoded: !!decoded, type: decoded?.type })
      const response = NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
      return setCorsHeaders(response, request.headers.get("origin"))
    }

    console.log("✅ Refresh token verified:", {
      userId: decoded.userId,
      username: decoded.username,
      jti: decoded.jti.substring(0, 8) + "...",
    })

    // Check if token is blacklisted
    const isBlacklisted = await Database.isTokenBlacklisted(decoded.jti)
    if (isBlacklisted) {
      console.log("❌ Token is blacklisted")
      const response = NextResponse.json({ error: "Token has been revoked" }, { status: 401 })
      return setCorsHeaders(response, request.headers.get("origin"))
    }

    // Get user with roles from database
    const user = await Database.getUserWithRoles(decoded.userId)
    if (!user) {
      console.log("❌ User not found:", decoded.userId)
      const response = NextResponse.json({ error: "User not found" }, { status: 404 })
      return setCorsHeaders(response, request.headers.get("origin"))
    }

    console.log("👤 User found:", user.username, "with", user.roles.length, "roles")

    const tokens = createTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map((role) => role.name), // Include current roles in token
    })

    console.log("🔑 New token pair created")

    // Store new refresh token
    await Database.storeRefreshToken({
      user_id: user.id,
      token_jti: tokens.refreshJti,
      expires_at: tokens.refreshTokenExpiry.toString(),
      user_agent: request.headers.get("user-agent") || undefined,
      ip_address: request.ip || undefined,
    })

    // Revoke old refresh token
    await Database.revokeRefreshToken(decoded.jti)

    console.log("🔄 Token refresh completed")

    const origin = request.headers.get("origin") || ""
    const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1")
    const isProduction = process.env.NODE_ENV === "production" && !isLocalhost
    const cookieDomain = isProduction ? ".wikipeoplestats.org" : undefined

    console.log("🍪 Setting cookies with config:", {
      isProduction,
      cookieDomain,
      origin,
    })

    // Set new cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    })

    response.cookies.set("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
      domain: cookieDomain,
    })

    response.cookies.set("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
      domain: cookieDomain,
    })

    response.cookies.set(
      "session_info",
      JSON.stringify({
        username: user.username,
        refreshed_at: new Date().toISOString(),
        roles_count: user.roles.length,
      }),
      {
        httpOnly: false,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 15 * 60,
        path: "/",
        domain: cookieDomain,
      },
    )

    console.log("✅ New cookies set successfully")

    return setCorsHeaders(response, request.headers.get("origin"))
  } catch (error) {
    console.error("❌ Token refresh error:", error)
    const response = NextResponse.json({ error: "Internal server error" }, { status: 500 })
    return setCorsHeaders(response, request.headers.get("origin"))
  }
}
