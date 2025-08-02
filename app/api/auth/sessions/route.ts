import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await SessionManager.getUserSessions(user.id)
    const currentSessionId = request.cookies.get("session_id")?.value

    const sessionsWithCurrent = sessions.map((session) => ({
      id: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      lastActivity: session.lastActivity.toISOString(),
      createdAt: session.createdAt.toISOString(),
      origin: session.origin,
      userAgent: session.userAgent,
      isCurrent: session.id === currentSessionId,
    }))

    return NextResponse.json({ sessions: sessionsWithCurrent })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, revokeAll } = body

    if (revokeAll) {
      const currentSessionId = request.cookies.get("session_id")?.value
      const revokedCount = await SessionManager.revokeAllUserSessions(user.id, currentSessionId)
      return NextResponse.json({
        success: true,
        message: `Revoked ${revokedCount} sessions`,
      })
    } else if (sessionId) {
      const success = await SessionManager.revokeSession(sessionId)
      if (success) {
        return NextResponse.json({ success: true, message: "Session revoked" })
      } else {
        return NextResponse.json({ error: "Failed to revoke session" }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: "Missing sessionId or revokeAll parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error revoking session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
