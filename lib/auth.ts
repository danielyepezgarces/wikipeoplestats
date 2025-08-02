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
    if (!sessionId) {
      return null
    }

    return await SessionManager.getSession(sessionId)
  }

  /**
   * Obtiene el usuario autenticado desde la sesión
   */
  static async getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
    const session = await this.getCurrentSession(request)
    if (!session) {
      return null
    }

    const user = await Database.getUserById(session.userId)
    if (!user) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isAuthenticated: true,
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static async isAuthenticated(request: NextRequest): Promise<boolean> {
    const session = await this.getCurrentSession(request)
    return session !== null
  }

  /**
   * Middleware helper para verificar autenticación
   */
  static async requireAuth(request: NextRequest): Promise<{ user: AuthUser; session: SessionData } | null> {
    const session = await this.getCurrentSession(request)
    if (!session) {
      return null
    }

    const user = await Database.getUserById(session.userId)
    if (!user) {
      return null
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAuthenticated: true,
      },
      session,
    }
  }

  /**
   * Invalida la sesión actual
   */
  static async logout(request: NextRequest): Promise<boolean> {
    const sessionId = request.cookies.get("session_id")?.value
    if (!sessionId) {
      return false
    }

    return await SessionManager.revokeSession(sessionId)
  }
}
