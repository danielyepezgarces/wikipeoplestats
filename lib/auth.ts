import type { NextRequest } from "next/server"
import { SessionManager, type SessionData } from "./session-manager"
import { Database } from "./database"

export interface AuthUser {
  id: number
  username: string
  email?: string
  roles?: string[]
  isAuthenticated: boolean
}

export class AuthService {
  /**
   * Obtiene la sesión actual desde las cookies
   */
  static async getCurrentSession(request: NextRequest): Promise<SessionData | null> {
    const sessionId = request.cookies.get("session_id")?.value
    if (!sessionId) return null

    return await SessionManager.getSession(sessionId)
  }

  /**
   * Obtiene el usuario autenticado desde la sesión
   */
  static async getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
    const session = await this.getCurrentSession(request)
    if (!session) return null

    return {
      id: session.userId,
      username: session.username,
      email: session.email,
      roles: session.roles,
      isAuthenticated: true,
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  static async hasRole(request: NextRequest, role: string): Promise<boolean> {
    const user = await this.getAuthenticatedUser(request)
    if (!user || !user.roles) return false

    return user.roles.includes(role)
  }

  /**
   * Verifica si el usuario es administrador
   */
  static async isAdmin(request: NextRequest): Promise<boolean> {
    return (await this.hasRole(request, "admin")) || (await this.hasRole(request, "super_admin"))
  }

  /**
   * Verifica si el usuario es moderador o superior
   */
  static async isModerator(request: NextRequest): Promise<boolean> {
    return (
      (await this.hasRole(request, "moderator")) ||
      (await this.hasRole(request, "admin")) ||
      (await this.hasRole(request, "super_admin"))
    )
  }

  /**
   * Middleware helper para verificar autenticación
   */
  static async requireAuth(request: NextRequest): Promise<AuthUser | Response> {
    const user = await this.getAuthenticatedUser(request)
    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }
    return user
  }

  /**
   * Middleware helper para verificar rol específico
   */
  static async requireRole(request: NextRequest, role: string): Promise<AuthUser | Response> {
    const user = await this.getAuthenticatedUser(request)
    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (!user.roles?.includes(role)) {
      return new Response("Forbidden", { status: 403 })
    }

    return user
  }

  /**
   * Obtiene información completa del usuario con roles
   */
  static async getUserWithRoles(userId: number): Promise<AuthUser | null> {
    try {
      const user = await Database.getUserById(userId)
      if (!user) return null

      // Obtener roles del usuario (si existe sistema de roles)
      const roles = await this.getUserRoles(userId)

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        roles,
        isAuthenticated: true,
      }
    } catch (error) {
      console.error("Error getting user with roles:", error)
      return null
    }
  }

  /**
   * Obtiene los roles de un usuario
   */
  private static async getUserRoles(userId: number): Promise<string[]> {
    try {
      const roles = await Database.query(
        `SELECT r.name 
         FROM user_roles ur 
         JOIN roles r ON ur.role_id = r.id 
         WHERE ur.user_id = ?`,
        [userId],
      )

      return roles.map((role: any) => role.name)
    } catch (error) {
      // Si no existe sistema de roles, devolver array vacío
      return []
    }
  }

  /**
   * Invalida la sesión actual
   */
  static async logout(request: NextRequest): Promise<boolean> {
    const sessionId = request.cookies.get("session_id")?.value
    if (!sessionId) return false

    return await SessionManager.revokeSession(sessionId)
  }

  /**
   * Invalida todas las sesiones de un usuario
   */
  static async logoutAllSessions(request: NextRequest): Promise<number> {
    const session = await this.getCurrentSession(request)
    if (!session) return 0

    return await SessionManager.revokeAllUserSessions(session.userId, session.id)
  }
}
