import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

interface JWTPayload {
  userId: number
  username: string
  email: string | null
}

function getUserFromToken(request: NextRequest): JWTPayload | null {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const sessions = await Database.getUserActiveSessions(user.userId)
    const stats = await Database.getSessionStats(user.userId)

    // Obtener información del dispositivo actual
    const currentTokenHash = request.cookies.get("auth_token")?.value
    let currentSessionId = null

    if (currentTokenHash) {
      const currentSession = await Database.getSessionByTokenHash(currentTokenHash)
      currentSessionId = currentSession?.id || null
    }

    const sessionsWithCurrent = sessions.map((session) => ({
      ...session,
      is_current: session.id === currentSessionId,
      device_name: session.device_info || "Dispositivo desconocido",
      location: session.ip_address ? `IP: ${session.ip_address}` : "Ubicación desconocida",
      browser: session.user_agent ? parseBrowser(session.user_agent) : "Navegador desconocido",
    }))

    return NextResponse.json({
      sessions: sessionsWithCurrent,
      stats,
    })
  } catch (error) {
    console.error("Error obteniendo sesiones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const action = searchParams.get("action") // 'revoke' | 'revoke-all' | 'revoke-others'

    if (action === "revoke-all") {
      const revokedCount = await Database.revokeAllUserSessions(user.userId)
      return NextResponse.json({
        message: `${revokedCount} sesiones revocadas`,
        revoked_count: revokedCount,
      })
    }

    if (action === "revoke-others") {
      const currentTokenHash = request.cookies.get("auth_token")?.value
      let currentSessionId = null

      if (currentTokenHash) {
        const currentSession = await Database.getSessionByTokenHash(currentTokenHash)
        currentSessionId = currentSession?.id || null
      }

      const revokedCount = await Database.revokeAllUserSessions(user.userId, currentSessionId)
      return NextResponse.json({
        message: `${revokedCount} otras sesiones revocadas`,
        revoked_count: revokedCount,
      })
    }

    if (sessionId) {
      const success = await Database.revokeSession(Number.parseInt(sessionId), user.userId)
      if (success) {
        return NextResponse.json({ message: "Sesión revocada exitosamente" })
      } else {
        return NextResponse.json({ error: "No se pudo revocar la sesión" }, { status: 400 })
      }
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
  } catch (error) {
    console.error("Error revocando sesiones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

function parseBrowser(userAgent: string): string {
  if (userAgent.includes("Chrome")) return "Chrome"
  if (userAgent.includes("Firefox")) return "Firefox"
  if (userAgent.includes("Safari")) return "Safari"
  if (userAgent.includes("Edge")) return "Edge"
  if (userAgent.includes("Opera")) return "Opera"
  return "Navegador desconocido"
}
