import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ authenticated: false, error: "No session found" }, { status: 401 })
    }

    // Verificar formato del session ID
    if (!SessionManager.isValidSessionId(sessionId)) {
      return NextResponse.json({ authenticated: false, error: "Invalid session format" }, { status: 401 })
    }

    // Obtener datos de la sesión
    const sessionData = await SessionManager.getSession(sessionId)

    if (!sessionData) {
      // Limpiar cookie inválida
      const response = NextResponse.json(
        { authenticated: false, error: "Session not found or expired" },
        { status: 401 },
      )
      response.cookies.delete("session_id")
      return response
    }

    // Extender sesión si está cerca de expirar (opcional)
    await SessionManager.extendSession(sessionId)

    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionData.userId,
        username: sessionData.username,
        email: sessionData.email,
        role: sessionData.role,
        chapter: sessionData.chapter,
      },
      session: {
        createdAt: sessionData.createdAt,
        lastUsed: sessionData.lastUsed,
      },
    })
  } catch (error) {
    console.error("❌ Session verification error:", error)
    return NextResponse.json({ authenticated: false, error: "Verification failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId || !SessionManager.isValidSessionId(sessionId)) {
      return NextResponse.json({ valid: false, error: "Invalid session ID" }, { status: 400 })
    }

    const sessionData = await SessionManager.getSession(sessionId)

    return NextResponse.json({
      valid: !!sessionData,
      user: sessionData
        ? {
            id: sessionData.userId,
            username: sessionData.username,
            email: sessionData.email,
            role: sessionData.role,
            chapter: sessionData.chapter,
          }
        : null,
    })
  } catch (error) {
    console.error("❌ Session validation error:", error)
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 })
  }
}
