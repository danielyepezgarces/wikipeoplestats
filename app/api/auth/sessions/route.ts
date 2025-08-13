import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { JWTManager } from "@/lib/jwt"
import { SecurityLogger } from "@/lib/security-logger"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ error: "No authentication token" }, { status: 401 })
    }

    const decoded = JWTManager.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if token is blacklisted
    const isBlacklisted = await Database.isTokenBlacklisted(token)
    if (isBlacklisted) {
      return NextResponse.json({ error: "Token revoked" }, { status: 401 })
    }

    const sessions = await Database.getUserActiveSessions(decoded.userId)
    const currentTokenHash = JWTManager.hashToken(token)

    // Mark current session
    const sessionsWithCurrent = sessions.map((session) => ({
      ...session,
      is_current: session.token_hash === currentTokenHash,
      device_type: getDeviceType(session.user_agent || ""),
      location: getLocationFromIP(session.ip_address || ""),
      last_used_relative: getRelativeTime(session.last_used),
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
      return NextResponse.json({ error: "No authentication token" }, { status: 401 })
    }

    const decoded = JWTManager.verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, action } = body

    const currentTokenHash = JWTManager.hashToken(token)
    const currentSession = await Database.getSessionByTokenHash(currentTokenHash)

    if (!currentSession) {
      return NextResponse.json({ error: "Current session not found" }, { status: 404 })
    }

    let revokedCount = 0

    if (action === "revoke_all_others") {
      // Revoke all other sessions except current
      const otherSessions = await Database.getUserActiveSessionsExcept(decoded.userId, currentSession.id)

      for (const session of otherSessions) {
        // Blacklist the token
        await Database.blacklistToken(session.token_hash, decoded.userId, "revoke_all_others")
        // Mark session as inactive
        await Database.revokeSession(session.id, decoded.userId)
      }

      revokedCount = otherSessions.length

      await SecurityLogger.logSecurityEvent({
        userId: decoded.userId,
        action: "revoke_all_other_sessions",
        details: { revokedCount },
        ipAddress: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      })
    } else if (sessionId) {
      // Revoke specific session
      const targetSession = await Database.getSessionById(sessionId)

      if (!targetSession || targetSession.user_id !== decoded.userId) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }

      // Prevent revoking current session
      if (targetSession.id === currentSession.id) {
        return NextResponse.json({ error: "Cannot revoke current session" }, { status: 400 })
      }

      // Blacklist the token
      await Database.blacklistToken(targetSession.token_hash, decoded.userId, "manual_revocation")

      // Mark session as inactive
      const success = await Database.revokeSession(sessionId, decoded.userId)

      if (!success) {
        return NextResponse.json({ error: "Failed to revoke session" }, { status: 500 })
      }

      revokedCount = 1

      await SecurityLogger.logSecurityEvent({
        userId: decoded.userId,
        action: "revoke_session",
        details: { sessionId, targetDevice: targetSession.device_info },
        ipAddress: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully revoked ${revokedCount} session(s)`,
      revokedCount,
    })
  } catch (error) {
    console.error("Error revoking sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase()

  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return "mobile"
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet"
  } else {
    return "desktop"
  }
}

function getLocationFromIP(ipAddress: string): string {
  // This is a placeholder - in production you'd use a geolocation service
  if (ipAddress.startsWith("192.168.") || ipAddress.startsWith("10.") || ipAddress.startsWith("172.")) {
    return "Local Network"
  }
  return "Unknown Location"
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
