import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { Database } from "@/lib/database"
import { createTokenPair, verifyToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

    console.log("🔄 Token refresh request:", {
      hasRefreshToken: !!refreshToken,
      refreshTokenPreview: refreshToken?.substring(0, 20) + "..." || "none",
    })

    if (!refreshToken) {
      console.log("❌ No refresh token provided")
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 })
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken)
    if (!decoded || decoded.type !== "refresh") {
      console.log("❌ Invalid refresh token:", { decoded: !!decoded, type: decoded?.type })
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
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
      return NextResponse.json({ error: "Token has been revoked" }, { status: 401 })
    }

    // Get user from database
    const user = await Database.getUserById(decoded.userId)
    if (!user) {
      console.log("❌ User not found:", decoded.userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("👤 User found:", user.username)

    // Create new token pair
    const tokens = createTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: ["user"], // Get from database in real implementation
    })

    console.log("🔑 New token pair created")

    // Store new refresh token
    await Database.storeRefreshToken({
      user_id: user.id,
      token_jti: tokens.refreshJti,
      expires_at: tokens.refreshTokenExpiry.toString(), // Convert to string
      user_agent: request.headers.get("user-agent") || undefined,
      ip_address: request.ip || undefined,
    })

    // Revoke old refresh token
    await Database.revokeRefreshToken(decoded.jti)

    console.log("🔄 Token refresh completed")

    const isProduction = process.env.NODE_ENV === "production"
    const cookieDomain = isProduction ? ".wikipeoplestats.org" : undefined

    // Set new cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
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

    console.log("✅ New cookies set successfully")

    return response
  } catch (error) {
    console.error("❌ Token refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
