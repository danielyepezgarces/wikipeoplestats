import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session_id")?.value

    if (sessionId) {
      // Destruir la sesión en la base de datos
      await SessionManager.destroySession(sessionId)
    }

    // Crear respuesta y limpiar cookie
    const response = NextResponse.json({
      message: "Logged out successfully",
      success: true,
    })

    response.cookies.delete("session_id")

    return response
  } catch (error) {
    console.error("❌ Logout error:", error)

    // Incluso si hay error, limpiar la cookie
    const response = NextResponse.json({
      message: "Logged out (with errors)",
      success: true,
    })

    response.cookies.delete("session_id")
    return response
  }
}

export async function GET(request: NextRequest) {
  // Permitir logout via GET también (para enlaces directos)
  return POST(request)
}
