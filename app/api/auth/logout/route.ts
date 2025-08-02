import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session_id")?.value

    if (sessionId) {
      await SessionManager.revokeSession(sessionId)
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" })

    // Eliminar cookie de sesión
    response.cookies.delete("session_id")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
