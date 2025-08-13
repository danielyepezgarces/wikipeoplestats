import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { Database } from "@/lib/database"
import { verifyToken, isTokenExpired, shouldRefreshToken, createTokenPair } from "@/lib/jwt"
import { setCorsHeaders, handleCorsOptions } from "@/lib/cors"

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request)
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get("access_token")?.value
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!accessToken) {
      const response = NextResponse.json({ authenticated: false, error: "No access token" }, { status: 401 })
      return setCorsHeaders(response, request.headers.get("origin"))
    }

    // Verify access token
    const decoded = verifyToken(accessToken)
    if (!decoded) {
      // Try to refresh if we have a refresh token
      if (refreshToken && !isTokenExpired(refreshToken)) {
        return await refreshTokens(refreshToken, request)
      }
      const response = NextResponse.json({ authenticated: false, error: "Invalid access token" }, { status: 401 })
      return setCorsHeaders(response, request.headers.get("origin"))
    }

    // Check if token is blacklisted
    const isBlacklisted = await Database.isTokenBlacklisted(decoded.jti)
    if (isBlacklisted) {
      const response = NextResponse.json({ authenticated: false, error: "Token revoked" }, { status: 401 })
      return setCorsHeaders(response, request.headers.get("origin"))
    }

    // Check if we should refresh the token (less than 5 minutes remaining)
    if (shouldRefreshToken(accessToken) && refreshToken) {
      return await refreshTokens(refreshToken, request)
    }

    // Get user from database
    const user = await Database.getUserById(decoded.userId)
    if (!user) {
      const response = NextResponse.json({ authenticated: false, error: "User not found" }, { status: 404 })
      return setCorsHeaders(response, request.headers.get("origin"))
    }

    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: decoded.roles,
      },
    })

    return setCorsHeaders(response, request.headers.get("origin"))
  } catch (error) {
    console.error("Token verification error:", error)
    const response = NextResponse.json({ authenticated: false, error: "Verification failed" }, { status: 500 })
    return setCorsHeaders(response, request.headers.get("origin"))
  }
}

async function refreshTokens(refreshToken: string, request: NextRequest) {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken)
    if (!decoded || decoded.type !== "refresh") {
      const response = NextResponse.json({ authenticated: false, error: "Invalid refresh token" }, { status: 401 })
      return setCorsHeaders(response, request.headers.get("origin"))
    }

    // Check if refresh token is blacklisted
    const isBlacklisted = await Database.isTokenBlacklisted(decoded.jti)
    if (isBlacklisted) {
      const response = NextResponse.json({ authenticated: false, error: "Refresh token revoked" }, { status: 401 })
      return setCorsHeaders(response, request.headers.get("origin"))
    }

    // Get user from database
    const user = await Database.getUserById(decoded.userId)
    if (!user) {
      const response = NextResponse.json({ authenticated: false, error: "User not found" }, { status: 404 })
      return setCorsHeaders(response, request.headers.get("origin"))
    }

    // Create new token pair
    const tokens = createTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: decoded.roles,
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

    // Create response with new tokens
    const response = NextResponse.json({
      authenticated: true,
      refreshed: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: decoded.roles,
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

    return setCorsHeaders(response, request.headers.get("origin"))
  } catch (error) {
    console.error("Token refresh error:", error)
    const response = NextResponse.json({ authenticated: false, error: "Refresh failed" }, { status: 500 })
    return setCorsHeaders(response, request.headers.get("origin"))
  }
}
