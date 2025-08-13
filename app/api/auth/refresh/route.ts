import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, createTokenPair } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 })
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken)
    if (!decoded || decoded.type !== "refresh") {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Check if token is blacklisted
    const isBlacklisted = await Database.isTokenBlacklisted(decoded.jti)
    if (isBlacklisted) {
      return NextResponse.json({ error: "Token has been revoked" }, { status: 401 })
    }

    // Check if refresh token exists in database
    const storedToken = await Database.getRefreshToken(decoded.jti)
    if (!storedToken) {
      return NextResponse.json({ error: "Refresh token not found" }, { status: 401 })
    }

    // Get user data
    const user = await Database.getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Create new token pair
    const tokenPair = createTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email || null,
      roles: [], // TODO: Get user roles
    })

    // Revoke old refresh token
    await Database.revokeRefreshToken(decoded.jti)

    // Store new refresh token
    await Database.storeRefreshToken({
      user_id: user.id,
      token_jti: tokenPair.refreshJti,
      expires_at: tokenPair.refreshTokenExpiry,
      user_agent: request.headers.get("user-agent") || undefined,
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
    })

    const response = NextResponse.json({
      success: true,
      expiresIn: 15 * 60, // 15 minutes
    })

    // Set new cookies
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

    return response
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
