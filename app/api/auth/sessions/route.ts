import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "No active session" }, { status: 401 })
    }

    // Verificar sesión actual
    const currentSession = await SessionManager.getSession(sessionId)
    if (!currentSession) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Obtener todas las sesiones del usuario
    const sessions = await SessionManager.getUserSessions(currentSession.userId)

    // Marcar la sesión actual
    const sessionsWithCurrent = sessions.map((session) => ({
      ...session,
      isCurrent: session.id === sessionId,
    }))

    return NextResponse.json({
      sessions: sessionsWithCurrent,
      currentSessionId: sessionId,
    })
  } catch (error) {
    console.error("❌ Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentSessionId = request.cookies.get("session_id")?.value
    const { searchParams } = new URL(request.url)
    const targetSessionId = searchParams.get("sessionId")
    const action = searchParams.get("action") // 'single' | 'all_others' | 'all'

    if (!currentSessionId) {
      return NextResponse.json({ error: "No active session" }, { status: 401 })
    }

    // Verificar sesión actual
    const currentSession = await SessionManager.getSession(currentSessionId)
    if (!currentSession) {
      return NextResponse.json({ error: "Invalid current session" }, { status: 401 })
    }

    let revokedCount = 0

    switch (action) {
      case "single":
        if (!targetSessionId) {
          return NextResponse.json({ error: "Session ID required for single revocation" }, { status: 400 })
        }

        const success = await SessionManager.destroySession(targetSessionId)
        revokedCount = success ? 1 : 0

        // Si se revocó la sesión actual, limpiar cookie
        if (targetSessionId === currentSessionId && success) {
          const response = NextResponse.json({
            message: "Current session revoked",
            revokedCount,
            currentSessionRevoked: true,
          })
          response.cookies.delete("session_id")
          return response
        }
        break

      case "all_others":
        revokedCount = await SessionManager.destroyAllUserSessions(currentSession.userId, currentSessionId)
        break

      case "all":
        revokedCount = await SessionManager.destroyAllUserSessions(currentSession.userId)
        const response = NextResponse.json({
          message: "All sessions revoked",
          revokedCount,
          currentSessionRevoked: true,
        })
        response.cookies.delete("session_id")
        return response

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      message: `Successfully revoked ${revokedCount} session(s)`,
      revokedCount,
      currentSessionRevoked: false,
    })
  } catch (error) {
    console.error("❌ Error revoking sessions:", error)
    return NextResponse.json({ error: "Failed to revoke sessions" }, { status: 500 })
  }
}
