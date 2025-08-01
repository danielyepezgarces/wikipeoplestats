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

    // Obtener el hash del token actual para identificar la sesión actual
    const currentTokenHash = JWTManager.hashToken(token)

    const sessionsWithCurrent = sessions.map((session) => ({
      ...session,
      is_current: session.token_hash === currentTokenHash,
    }))

    return NextResponse.json({ sessions: sessionsWithCurrent })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    const userId = Number.parseInt(decoded.userId)
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    const action = searchParams.get("action")

    if (action === "revoke_all_others") {
      // Obtener el hash del token actual
      const currentTokenHash = JWTManager.hashToken(token)

      // Obtener la sesión actual
      const currentSession = await Database.getSessionByTokenHash(currentTokenHash)
      const currentSessionId = currentSession?.id

      // Obtener todas las otras sesiones activas
      const otherSessions = await Database.getUserActiveSessionsExcept(userId, currentSessionId)

      // Agregar todos los tokens de las otras sesiones a la blacklist
      for (const session of otherSessions) {
        await Database.blacklistToken(session.token_hash, userId, "revoke_all_others")
      }

      // Revocar todas las otras sesiones en la base de datos
      const revokedCount = await Database.revokeAllUserSessions(userId, currentSessionId)

      return NextResponse.json({
        message: `${revokedCount} sessions revoked`,
        revoked_count: revokedCount,
      })
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    // Obtener la sesión a revocar
    const sessionToRevoke = await Database.getSessionById(Number.parseInt(sessionId))
    if (!sessionToRevoke || sessionToRevoke.user_id !== userId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Agregar el token a la blacklist
    await Database.blacklistToken(sessionToRevoke.token_hash, userId, "manual_revocation")

    // Revocar la sesión
    const success = await Database.revokeSession(Number.parseInt(sessionId), userId)

    if (!success) {
      return NextResponse.json({ error: "Failed to revoke session" }, { status: 500 })
    }

    return NextResponse.json({ message: "Session revoked successfully" })
  } catch (error) {
    console.error("Error revoking session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
