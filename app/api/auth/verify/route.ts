import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const session = await SessionManager.getSession(sessionId)

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        username: session.username,
        email: session.email,
        roles: session.roles,
      },
      session: {
        id: session.id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        lastActivity: session.lastActivity,
        deviceInfo: session.deviceInfo,
        origin: session.origin,
      },
    })
  } catch (error) {
    console.error("❌ Error verifying session:", error)
    return NextResponse.json({ authenticated: false, error: "Internal server error" }, { status: 500 })
  }
}
