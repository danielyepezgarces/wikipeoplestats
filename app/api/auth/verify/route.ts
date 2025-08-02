import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import { Database } from "@/lib/database"

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

    const user = await Database.getUserById(session.userId)

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_claimed: user.is_claimed,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
        lastUsed: session.lastUsed,
      },
    })
  } catch (error) {
    console.error("Error verifying session:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
