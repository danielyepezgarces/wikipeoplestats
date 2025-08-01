import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { JWTManager } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = JWTManager.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = Number.parseInt(decoded.userId)
    const sessions = await Database.getUserActiveSessions(userId)
    const stats = await Database.getSessionStats(userId)

    return NextResponse.json({
      sessions,
      stats,
      current_session_id: null, // We could track this if needed
    })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Internal server error", message: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = JWTManager.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    const action = searchParams.get("action") // 'revoke' or 'revoke_all_others'

    if (action === "revoke_all_others") {
      const revokedCount = await Database.revokeAllUserSessions(Number.parseInt(decoded.userId))
      return NextResponse.json({
        success: true,
        message: `Revoked ${revokedCount} sessions`,
      })
    } else if (sessionId) {
      const success = await Database.revokeSession(Number.parseInt(sessionId), Number.parseInt(decoded.userId))
      if (success) {
        return NextResponse.json({
          success: true,
          message: "Session revoked successfully",
        })
      } else {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error revoking session:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Internal server error", message: errorMessage }, { status: 500 })
  }
}
