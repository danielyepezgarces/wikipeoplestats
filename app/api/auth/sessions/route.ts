import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await AuthService.requireAuth(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await SessionManager.getUserSessions(auth.user.id)
    const stats = await SessionManager.getSessionStats(auth.user.id)

    return NextResponse.json({
      sessions,
      stats,
      current_session_id: auth.session.id,
    })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await AuthService.requireAuth(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    const action = searchParams.get("action") // 'revoke' or 'revoke_all_others'

    if (action === "revoke_all_others") {
      const revokedCount = await SessionManager.revokeAllUserSessions(auth.user.id, auth.session.id)
      return NextResponse.json({
        success: true,
        message: `Revoked ${revokedCount} sessions`,
      })
    } else if (sessionId) {
      const success = await SessionManager.revokeSession(sessionId, auth.user.id)
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
