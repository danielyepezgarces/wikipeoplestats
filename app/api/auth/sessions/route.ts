import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { SessionManager } from "@/lib/session-manager"

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request)

    const sessions = await SessionManager.getUserSessions(user.id)

    return NextResponse.json({
      sessions: sessions.map((session) => ({
        id: session.id,
        device_info: session.device_info,
        ip_address: session.ip_address,
        origin_domain: session.origin_domain,
        created_at: session.created_at,
        last_used: session.last_used,
        is_current: session.id === user.session_id,
      })),
    })
  } catch (error) {
    console.error("Error getting sessions:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication required" },
      { status: 401 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    const action = searchParams.get("action")

    if (action === "revoke_all") {
      const currentToken = request.cookies.get("auth_token")?.value
      const revokedCount = await SessionManager.revokeAllUserSessions(user.id, currentToken)

      return NextResponse.json({
        message: `${revokedCount} sessions revoked`,
        revoked_count: revokedCount,
      })
    }

    if (sessionId) {
      const success = await SessionManager.revokeSession(sessionId)

      if (success) {
        return NextResponse.json({ message: "Session revoked successfully" })
      } else {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("Error revoking sessions:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication required" },
      { status: 401 },
    )
  }
}
