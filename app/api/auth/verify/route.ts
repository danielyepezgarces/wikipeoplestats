import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { JWTManager } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    // Verify JWT token
    const decoded = JWTManager.verifyToken(token)
    if (!decoded) {
      const response = NextResponse.json({ authenticated: false, user: null })
      response.cookies.delete("auth_token")
      return response
    }

    // Check if token is blacklisted
    const isBlacklisted = await Database.isTokenBlacklisted(token)
    if (isBlacklisted) {
      const response = NextResponse.json({
        authenticated: false,
        user: null,
        error: "Token has been revoked",
      })
      response.cookies.delete("auth_token")
      return response
    }

    // Get user from database to ensure they still exist and are active
    const user = await Database.getUserById(decoded.userId)
    if (!user || !user.is_active) {
      const response = NextResponse.json({ authenticated: false, user: null })
      response.cookies.delete("auth_token")
      return response
    }

    // Update session last used time
    const tokenHash = JWTManager.hashToken(token)
    const session = await Database.getSessionByTokenHash(tokenHash)
    if (session) {
      await Database.updateSessionLastUsed(session.id)
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        is_claimed: user.is_claimed,
      },
    })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 })
  }
}
