import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value
    const refreshToken = request.cookies.get("refresh_token")?.value

    // Blacklist access token if present
    if (accessToken) {
      const decoded = verifyToken(accessToken)
      if (decoded) {
        await Database.blacklistToken(decoded.jti, "access", decoded.userId)
      }
    }

    // Revoke refresh token if present
    if (refreshToken) {
      const decoded = verifyToken(refreshToken)
      if (decoded) {
        await Database.revokeRefreshToken(decoded.jti)
        await Database.blacklistToken(decoded.jti, "refresh", decoded.userId)
      }
    }

    const response = NextResponse.json({ message: "Logged out successfully" })

    // Clear cookies
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
