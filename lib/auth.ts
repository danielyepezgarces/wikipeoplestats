import type { NextRequest } from "next/server"
import { SessionManager, type SessionData } from "./session-manager"
import { Database } from "./database"

export interface AuthUser {
  id: number
  username: string
  email?: string
  roles?: string[]
  chapter_id?: number
  chapter_admin_ids?: number[]
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

    // Obtener roles del usuario
    const roles = await this.getUserRoles(session.userId)
    const chapterInfo = await this.getUserChapterInfo(session.userId)

    return {
      id: session.userId,
      username: session.username,
      email: session.email,
      roles,
      chapter_id: chapterInfo.chapter_id,
      chapter_admin_ids: chapterInfo.admin_chapter_ids,
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

      // Obtener roles del usuario
      const roles = await this.getUserRoles(userId)
      const chapterInfo = await this.getUserChapterInfo(userId)

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        roles,
        chapter_id: chapterInfo.chapter_id,
        chapter_admin_ids: chapterInfo.admin_chapter_ids,
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
   * Obtiene información de capítulos del usuario
   */
  private static async getUserChapterInfo(userId: number): Promise<{
    chapter_id?: number
    admin_chapter_ids: number[]
  }> {
    try {
      const chapterRoles = await Database.query(
        `SELECT ur.chapter_id, r.name as role_name
         FROM user_roles ur 
         JOIN roles r ON ur.role_id = r.id 
         WHERE ur.user_id = ? AND ur.chapter_id IS NOT NULL`,
        [userId],
      )

      const adminChapterIds: number[] = []
      let primaryChapterId: number | undefined

      chapterRoles.forEach((role: any) => {
        if (role.role_name === "chapter_admin") {
          adminChapterIds.push(role.chapter_id)
        }
        if (!primaryChapterId) {
          primaryChapterId = role.chapter_id
        }
      })

      return {
        chapter_id: primaryChapterId,
        admin_chapter_ids: adminChapterIds,
      }
    } catch (error) {
      return { admin_chapter_ids: [] }
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

/**
 * Función helper para obtener el usuario actual (compatible con el código existente)
 */
export async function getCurrentUser(request?: NextRequest): Promise<AuthUser | null> {
  if (!request) return null
  return await AuthService.getAuthenticatedUser(request)
}
