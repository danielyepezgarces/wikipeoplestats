import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    // Verify JWT token
    const payload = verifyToken(token)
    if (!payload || typeof payload === "string") {
      return NextResponse.json({ authenticated: false, user: null })
    }

    // Get user from database
    const user = await Database.getUserById(payload.userId)
    if (!user || !user.is_active) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    // Return user info
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
    return NextResponse.json({ authenticated: false, user: null })
  }
}
