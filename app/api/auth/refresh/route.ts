import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { Database } from "@/lib/database"
import { createTokenPair, verifyToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

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

    // Get user from database
    const user = await Database.getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create new token pair
    const tokens = createTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: ["user"], // Get from database in real implementation
    })

    // Store new refresh token
    await Database.storeRefreshToken({
      user_id: user.id,
      token_jti: tokens.refreshJti,
      expires_at: tokens.refreshTokenExpiry,
      user_agent: request.headers.get("user-agent") || undefined,
      ip_address: request.ip || undefined,
    })

    // Revoke old refresh token
    await Database.revokeRefreshToken(decoded.jti)

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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
    })

    response.cookies.set("refresh_token", tokens.refreshToken, {
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
