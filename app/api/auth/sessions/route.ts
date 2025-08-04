import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import { requireAuth } from "@/lib/auth-middleware-new"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const sessions = await SessionManager.getUserActiveSessions(auth.userId)

    const sessionToken = request.cookies.get("session_token")?.value

    const sessionsWithCurrent = sessions.map((session) => ({
      ...session,
      is_current: session.session_token === sessionToken,
    }))

    return NextResponse.json({ sessions: sessionsWithCurrent })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { 
      status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 
    })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const sessionToken = request.cookies.get("session_token")?.value

    const { searchParams } = new URL(request.url)
    const targetSessionToken = searchParams.get("session_token")
    const action = searchParams.get("action")

    if (action === "revoke_all_others") {
      const revokedCount = await SessionManager.revokeAllUserSessionsExcept(auth.userId, sessionToken)

      return NextResponse.json({
        message: `${revokedCount} sessions revoked`,
        revoked_count: revokedCount,
      })
    }

    if (!targetSessionToken) {
      return NextResponse.json({ error: "Session token required" }, { status: 400 })
    }

    // Verificar que la sesión pertenece al usuario
    const sessionToRevoke = await SessionManager.getSessionWithUser(targetSessionToken)
    if (!sessionToRevoke || sessionToRevoke.user_id !== auth.userId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Revocar la sesión
    const success = await SessionManager.revokeSession(targetSessionToken)

    if (!success) {
      return NextResponse.json({ error: "Failed to revoke session" }, { status: 500 })
    }

    return NextResponse.json({ message: "Session revoked successfully" })
  } catch (error) {
    console.error("Error revoking session:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { 
      status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 
    })
  }
}
