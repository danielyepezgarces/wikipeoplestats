import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { JWTManager } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = JWTManager.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Verificar si el token está en la blacklist
    const isBlacklisted = await Database.isTokenBlacklisted(token)
    if (isBlacklisted) {
      return NextResponse.json({ error: "Token revoked" }, { status: 401 })
    }

    const userId = Number.parseInt(decoded.userId)
    const sessions = await Database.getUserActiveSessions(userId)
    const stats = await Database.getSessionStats(userId)

    // Obtener el session_id actual del token
    const currentSessionId = decoded.sessionId ? Number.parseInt(decoded.sessionId) : null

    return NextResponse.json({
      sessions,
      stats,
      current_session_id: currentSessionId,
    })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Internal server error", message: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = JWTManager.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Verificar si el token está en la blacklist
    const isBlacklisted = await Database.isTokenBlacklisted(token)
    if (isBlacklisted) {
      return NextResponse.json({ error: "Token revoked" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    const action = searchParams.get("action")

    if (action === "revoke_all_others") {
      // Obtener todas las sesiones del usuario excepto la actual
      const currentSessionId = decoded.sessionId ? Number.parseInt(decoded.sessionId) : null
      const sessionsToRevoke = await Database.getUserActiveSessionsExcept(
        Number.parseInt(decoded.userId),
        currentSessionId,
      )

      // Agregar todos los tokens a la blacklist
      for (const session of sessionsToRevoke) {
        if (session.token_hash) {
          await Database.blacklistToken(session.token_hash, Number.parseInt(decoded.userId))
        }
      }

      // Revocar las sesiones en la base de datos
      const revokedCount = await Database.revokeAllUserSessions(Number.parseInt(decoded.userId), currentSessionId)

      return NextResponse.json({
        success: true,
        message: `Revoked ${revokedCount} sessions`,
      })
    } else if (sessionId) {
      // Obtener la sesión específica para obtener su token
      const session = await Database.getSessionById(Number.parseInt(sessionId))
      if (session && session.user_id === Number.parseInt(decoded.userId)) {
        // Agregar el token a la blacklist
        if (session.token_hash) {
          await Database.blacklistToken(session.token_hash, Number.parseInt(decoded.userId))
        }

        // Revocar la sesión
        const success = await Database.revokeSession(Number.parseInt(sessionId), Number.parseInt(decoded.userId))

        if (success) {
          return NextResponse.json({
            success: true,
            message: "Session revoked successfully",
          })
        } else {
          return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }
      } else {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error revoking session:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Internal server error", message: errorMessage }, { status: 500 })
  }
}
