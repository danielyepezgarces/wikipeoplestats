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

    return NextResponse.json({
      sessions: sessions.map((session) => ({
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        origin: session.origin,
        isCurrent: session.id === request.cookies.get("session_id")?.value,
      })),
    })
  } catch (error) {
    console.error("❌ Error getting user sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const all = searchParams.get("all") === "true"

    if (all) {
      // Revocar todas las sesiones excepto la actual
      const currentSessionId = request.cookies.get("session_id")?.value
      const revokedCount = await SessionManager.revokeAllUserSessions(user.id, currentSessionId)

      return NextResponse.json({
        success: true,
        message: `Revoked ${revokedCount} sessions`,
        revokedCount,
      })
    } else if (sessionId) {
      // Revocar sesión específica
      const success = await SessionManager.revokeSession(sessionId)

      if (success) {
        return NextResponse.json({
          success: true,
          message: "Session revoked successfully",
        })
      } else {
        return NextResponse.json({ error: "Failed to revoke session" }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: "Missing sessionId or all parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("❌ Error revoking sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
