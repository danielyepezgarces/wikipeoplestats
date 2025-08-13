import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { Database } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get("access_token")?.value
    const refreshToken = cookieStore.get("refresh_token")?.value

    // If we have tokens, revoke them
    if (accessToken) {
      const decoded = verifyToken(accessToken)
      if (decoded) {
        // Blacklist access token
        await Database.blacklistToken(decoded.jti, decoded.userId, "User logout")
      }
    }

    if (refreshToken) {
      const decoded = verifyToken(refreshToken)
      if (decoded) {
        // Revoke refresh token
        await Database.revokeRefreshToken(decoded.jti)
      }
    }

    // Create response and clear cookies
    const response = NextResponse.json({ success: true, message: "Logged out successfully" })

    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")

    return response
  } catch (error) {
    console.error("Logout error:", error)

    // Even if there's an error, clear the cookies
    const response = NextResponse.json({ success: true, message: "Logged out" })
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")

    return response
  }
}
