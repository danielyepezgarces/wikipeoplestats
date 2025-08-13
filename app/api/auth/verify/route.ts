import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, shouldRefreshToken, createTokenPair } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Verifying authentication...")

    // Obtener access token de las cookies
    const accessToken = request.cookies.get("access_token")?.value
    const refreshToken = request.cookies.get("refresh_token")?.value

    if (!accessToken) {
      return NextResponse.json({ authenticated: false, error: "No access token" }, { status: 401 })
    }

    // Verificar si el access token es válido
    const decoded = verifyToken(accessToken)

    if (!decoded) {
      // Access token is invalid, try to refresh
      if (!refreshToken) {
        return NextResponse.json({ authenticated: false, error: "Invalid access token" }, { status: 401 })
      }

      const refreshDecoded = verifyToken(refreshToken)
      if (!refreshDecoded || refreshDecoded.type !== "refresh") {
        return NextResponse.json({ authenticated: false, error: "Invalid refresh token" }, { status: 401 })
      }

      // Check if refresh token is blacklisted
      const isBlacklisted = await Database.isTokenBlacklisted(refreshDecoded.jti)
      if (isBlacklisted) {
        return NextResponse.json({ authenticated: false, error: "Token revoked" }, { status: 401 })
      }

      // Get user and create new tokens
      const user = await Database.getUserById(refreshDecoded.userId)
      if (!user) {
        return NextResponse.json({ authenticated: false, error: "User not found" }, { status: 401 })
      }

      const tokenPair = createTokenPair({
        userId: user.id,
        username: user.username,
        email: user.email || null,
        roles: [], // TODO: Get user roles
      })

      // Revoke old refresh token and store new one
      await Database.revokeRefreshToken(refreshDecoded.jti)
      await Database.storeRefreshToken({
        user_id: user.id,
        token_jti: tokenPair.refreshJti,
        expires_at: tokenPair.refreshTokenExpiry,
        user_agent: request.headers.get("user-agent") || undefined,
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      })

      const response = NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        refreshed: true,
      })

      // Set new cookies
      response.cookies.set("access_token", tokenPair.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
        path: "/",
        domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
      })

      response.cookies.set("refresh_token", tokenPair.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
      })

      return response
    }

    // Check if token is blacklisted
    const isBlacklisted = await Database.isTokenBlacklisted(decoded.jti)
    if (isBlacklisted) {
      return NextResponse.json({ authenticated: false, error: "Token revoked" }, { status: 401 })
    }

    // Get user data
    const user = await Database.getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ authenticated: false, error: "User not found" }, { status: 401 })
    }

    // Check if we should refresh the token proactively
    if (shouldRefreshToken(accessToken) && refreshToken) {
      const refreshDecoded = verifyToken(refreshToken)
      if (refreshDecoded && refreshDecoded.type === "refresh") {
        const tokenPair = createTokenPair({
          userId: user.id,
          username: user.username,
          email: user.email || null,
          roles: [], // TODO: Get user roles
        })

        await Database.revokeRefreshToken(refreshDecoded.jti)
        await Database.storeRefreshToken({
          user_id: user.id,
          token_jti: tokenPair.refreshJti,
          expires_at: tokenPair.refreshTokenExpiry,
          user_agent: request.headers.get("user-agent") || undefined,
          ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        })

        const response = NextResponse.json({
          authenticated: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
          refreshed: true,
        })

        response.cookies.set("access_token", tokenPair.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60,
          path: "/",
          domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
        })

        response.cookies.set("refresh_token", tokenPair.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
          domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
        })

        return response
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("❌ Auth verification error:", error)
    return NextResponse.json({ authenticated: false, error: "Verification failed" }, { status: 500 })
  }
}
