import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { JWTManager } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    // Add CORS headers
    const origin = request.headers.get("origin")
    const response = new NextResponse()

    // Allow requests from wikipeoplestats.org subdomains
    if (origin && origin.includes("wikipeoplestats.org")) {
      response.headers.set("Access-Control-Allow-Origin", origin)
      response.headers.set("Access-Control-Allow-Credentials", "true")
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    }

    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false, user: null },
        {
          status: 200,
          headers: response.headers,
        },
      )
    }

    // Verify JWT token
    const decoded = JWTManager.verifyToken(token)
    if (!decoded) {
      const res = NextResponse.json(
        { authenticated: false, user: null },
        {
          status: 200,
          headers: response.headers,
        },
      )
      res.cookies.delete("auth_token")
      return res
    }

    // Check if token is blacklisted
    const isBlacklisted = await Database.isTokenBlacklisted(token)
    if (isBlacklisted) {
      const res = NextResponse.json(
        {
          authenticated: false,
          user: null,
          error: "Token has been revoked",
        },
        {
          status: 200,
          headers: response.headers,
        },
      )
      res.cookies.delete("auth_token")
      return res
    }

    // Get user from database to ensure they still exist and are active
    const user = await Database.getUserById(decoded.userId)
    if (!user || !user.is_active) {
      const res = NextResponse.json(
        { authenticated: false, user: null },
        {
          status: 200,
          headers: response.headers,
        },
      )
      res.cookies.delete("auth_token")
      return res
    }

    // Update session last used time
    const tokenHash = JWTManager.hashToken(token)
    const session = await Database.getSessionByTokenHash(tokenHash)
    if (session) {
      await Database.updateSessionLastUsed(session.id)
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          is_claimed: user.is_claimed,
        },
      },
      {
        status: 200,
        headers: response.headers,
      },
    )
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 })
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin")

  if (origin && origin.includes("wikipeoplestats.org")) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  return new NextResponse(null, { status: 200 })
}
