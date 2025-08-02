import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { SessionManager } from "@/lib/session-manager"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await SessionManager.getUserSessions(user.id)
    const cookieStore = await cookies()
    const currentSessionId = cookieStore.get("session_id")?.value

    // Marcar la sesión actual
    const sessionsWithCurrent = sessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    }))

    return NextResponse.json({ sessions: sessionsWithCurrent })
  } catch (error) {
    console.error("Error getting sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, revokeAll } = body

    if (revokeAll) {
      const cookieStore = await cookies()
      const currentSessionId = cookieStore.get("session_id")?.value
      const revokedCount = await SessionManager.revokeAllUserSessions(user.id, currentSessionId)

      return NextResponse.json({
        message: `Revoked ${revokedCount} sessions`,
        revokedCount,
      })
    } else if (sessionId) {
      const success = await SessionManager.revokeSession(sessionId)

      if (success) {
        return NextResponse.json({ message: "Session revoked successfully" })
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
