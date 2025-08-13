import type { NextRequest } from "next/server"
import { JWTManager } from "./jwt"
import { Database } from "./database"
import { SecurityLogger } from "./security-logger"

export interface AuthContext {
  userId: number
  username: string
  sessionId: number
  isAuthenticated: boolean
}

export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  try {
    // Initialize database tables if needed
    await Database.initializeTables()

    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return null
    }

    // Check if token is blacklisted
    if (await Database.isTokenBlacklisted(token)) {
      await SecurityLogger.logSuspiciousActivity({
        action: "blacklisted_token_used",
        details: { token_hash: Database.hashToken(token) },
        ip_address: request.ip,
        user_agent: request.headers.get("user-agent") || undefined,
        severity: "high",
      })
      return null
    }

    // Verify JWT token
    const payload = JWTManager.verifyToken(token)

    // Verify session exists and is active
    const tokenHash = Database.hashToken(token)
    const session = await Database.getSessionByTokenHash(tokenHash)

    if (!session || !session.is_active) {
      await SecurityLogger.logSuspiciousActivity({
        user_id: payload.userId,
        action: "invalid_session_used",
        details: { session_id: payload.sessionId },
        ip_address: request.ip,
        user_agent: request.headers.get("user-agent") || undefined,
        severity: "medium",
      })
      return null
    }

    // Update session last used
    await Database.updateSessionLastUsed(session.id)

    return {
      userId: payload.userId,
      username: payload.username,
      sessionId: payload.sessionId,
      isAuthenticated: true,
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const auth = await getAuthContext(request)

  if (!auth) {
    throw new Error("Authentication required")
  }

  return auth
}

export async function requireAnyRole(request: NextRequest, roles: string[], chapterId?: number): Promise<AuthContext> {
  const auth = await requireAuth(request)

  // Import RoleManager here to avoid circular dependency
  const { RoleManager } = await import("./role-manager")

  const hasPermission = await RoleManager.hasAnyRole(auth.userId, roles, chapterId)

  if (!hasPermission) {
    await SecurityLogger.logPermissionDenied({
      user_id: auth.userId,
      action: "role_check_failed",
      resource: `roles: ${roles.join(", ")}${chapterId ? `, chapter: ${chapterId}` : ""}`,
      ip_address: request.ip,
      user_agent: request.headers.get("user-agent") || undefined,
    })
    throw new Error(`Insufficient permissions. Required roles: ${roles.join(", ")}`)
  }

  return auth
}

export async function requireRole(request: NextRequest, role: string, chapterId?: number): Promise<AuthContext> {
  return requireAnyRole(request, [role], chapterId)
}
