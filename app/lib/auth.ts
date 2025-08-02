import { SessionManager, type SessionData } from "./session-manager"
import { Database } from "./database"

export interface AuthUser {
  id: number
  username: string
  email?: string
  role?: string
  chapter?: string
  avatarUrl?: string
  isActive: boolean
  isClaimed: boolean
}

export class AuthService {
  /**
   * Verifica si un usuario está autenticado basado en su session ID
   */
  static async verifySession(sessionId: string): Promise<SessionData | null> {
    if (!sessionId || !SessionManager.isValidSessionId(sessionId)) {
      return null
    }

    return await SessionManager.getSession(sessionId)
  }

  /**
   * Obtiene información completa del usuario autenticado
   */
  static async getAuthenticatedUser(sessionId: string): Promise<AuthUser | null> {
    const sessionData = await this.verifySession(sessionId)
    if (!sessionData) return null

    const user = await Database.getUserById(sessionData.userId)
    if (!user) return null

    const userRole = await Database.getUserRole(user.id)

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: userRole?.role,
      chapter: userRole?.chapter_name,
      avatarUrl: user.avatar_url,
      isActive: user.is_active,
      isClaimed: user.is_claimed,
    }
  }

  /**
   * Verifica si un usuario tiene un rol específico
   */
  static async hasRole(sessionId: string, requiredRole: string): Promise<boolean> {
    const sessionData = await this.verifySession(sessionId)
    if (!sessionData) return false

    const userRole = await Database.getUserRole(sessionData.userId)
    return userRole?.role === requiredRole
  }

  /**
   * Verifica si un usuario tiene permisos de administrador
   */
  static async isAdmin(sessionId: string): Promise<boolean> {
    return (await this.hasRole(sessionId, "admin")) || (await this.hasRole(sessionId, "super_admin"))
  }

  /**
   * Verifica si un usuario pertenece a un capítulo específico
   */
  static async belongsToChapter(sessionId: string, chapterId: number): Promise<boolean> {
    const sessionData = await this.verifySession(sessionId)
    if (!sessionData) return false

    const userRole = await Database.getUserRole(sessionData.userId)
    return userRole?.chapter_id === chapterId
  }

  /**
   * Cierra todas las sesiones de un usuario excepto la actual
   */
  static async logoutOtherSessions(sessionId: string): Promise<number> {
    const sessionData = await this.verifySession(sessionId)
    if (!sessionData) return 0

    return await SessionManager.destroyAllUserSessions(sessionData.userId, sessionId)
  }

  /**
   * Cierra todas las sesiones de un usuario
   */
  static async logoutAllSessions(userId: number): Promise<number> {
    return await SessionManager.destroyAllUserSessions(userId)
  }

  /**
   * Obtiene estadísticas de sesión para un usuario
   */
  static async getSessionStats(sessionId: string): Promise<{
    total_sessions: number
    active_sessions: number
    devices: string[]
    last_login_ip: string | null
  } | null> {
    const sessionData = await this.verifySession(sessionId)
    if (!sessionData) return null

    return await Database.getSessionStats(sessionData.userId)
  }

  /**
   * Middleware helper para verificar autenticación en API routes
   */
  static async requireAuth(request: Request): Promise<SessionData | Response> {
    const sessionId = this.extractSessionId(request)

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "No session found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const sessionData = await this.verifySession(sessionId)

    if (!sessionData) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    return sessionData
  }

  /**
   * Middleware helper para verificar rol específico
   */
  static async requireRole(request: Request, requiredRole: string): Promise<SessionData | Response> {
    const authResult = await this.requireAuth(request)

    if (authResult instanceof Response) {
      return authResult // Error de autenticación
    }

    const hasRequiredRole = await this.hasRole(this.extractSessionId(request)!, requiredRole)

    if (!hasRequiredRole) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    return authResult
  }

  /**
   * Extrae el session ID de una request
   */
  private static extractSessionId(request: Request): string | null {
    const cookieHeader = request.headers.get("cookie")
    if (!cookieHeader) return null

    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = value
        return acc
      },
      {} as Record<string, string>,
    )

    return cookies.session_id || null
  }
}

// Funciones de conveniencia para usar en API routes
export async function getAuthenticatedUser(request: Request): Promise<AuthUser | null> {
  const sessionId = AuthService["extractSessionId"](request)
  if (!sessionId) return null

  return await AuthService.getAuthenticatedUser(sessionId)
}

export async function requireAuth(request: Request): Promise<SessionData | Response> {
  return await AuthService.requireAuth(request)
}

export async function requireRole(request: Request, role: string): Promise<SessionData | Response> {
  return await AuthService.requireRole(request, role)
}
