import crypto from "crypto"
import { Database, type User } from "./database"

export interface SessionData {
  userId: number
  username: string
  email?: string
  role?: string
  chapter?: string
  createdAt: string
  lastUsed: string
}

export class SessionManager {
  private static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 días en ms
  private static readonly CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hora en ms

  /**
   * Genera un session ID único y seguro
   */
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  /**
   * Crea una nueva sesión del servidor
   */
  static async createSession(
    user: User,
    request: {
      origin: string
      userAgent?: string
      ipAddress?: string
      deviceInfo?: string
    },
  ): Promise<string> {
    const sessionId = this.generateSessionId()
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION)

    // Usar la tabla sessions existente pero con session_id en lugar de token_hash
    await Database.createSession({
      user_id: user.id,
      token_hash: sessionId, // Reutilizamos este campo para el session_id
      expires_at: expiresAt.toISOString().slice(0, 19).replace("T", " "),
      origin_domain: request.origin,
      user_agent: request.userAgent,
      ip_address: request.ipAddress,
      device_info: request.deviceInfo,
    })

    return sessionId
  }

  /**
   * Verifica y obtiene los datos de una sesión
   */
  static async getSession(sessionId: string): Promise<SessionData | null> {
    if (!sessionId) return null

    // Buscar por token_hash que ahora contiene el session_id
    const session = await Database.getSessionByTokenHash(sessionId)
    if (!session) return null

    // Verificar si la sesión ha expirado
    if (new Date(session.expires_at) < new Date()) {
      await this.destroySession(sessionId)
      return null
    }

    // Actualizar último uso
    await Database.updateSessionLastUsed(session.id)

    // Obtener datos del usuario
    const user = await Database.getUserById(session.user_id)
    if (!user || !user.is_active) {
      await this.destroySession(sessionId)
      return null
    }

    // Obtener rol del usuario (si existe)
    const userRole = await Database.getUserRole(user.id)

    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: userRole?.role,
      chapter: userRole?.chapter_name,
      createdAt: session.created_at,
      lastUsed: session.last_used,
    }
  }

  /**
   * Destruye una sesión específica
   */
  static async destroySession(sessionId: string): Promise<boolean> {
    const session = await Database.getSessionByTokenHash(sessionId)
    if (!session) return false

    return await Database.revokeSession(session.id)
  }

  /**
   * Destruye todas las sesiones de un usuario excepto la actual
   */
  static async destroyAllUserSessions(userId: number, exceptSessionId?: string): Promise<number> {
    let exceptDbId: number | undefined

    if (exceptSessionId) {
      const currentSession = await Database.getSessionByTokenHash(exceptSessionId)
      exceptDbId = currentSession?.id
    }

    return await Database.revokeAllUserSessions(userId, exceptDbId)
  }

  /**
   * Obtiene todas las sesiones activas de un usuario
   */
  static async getUserSessions(userId: number): Promise<any[]> {
    const sessions = await Database.getUserActiveSessions(userId)

    return sessions.map((session) => ({
      id: session.token_hash, // El session_id está en token_hash
      deviceInfo: session.device_info,
      ipAddress: session.ip_address,
      lastUsed: session.last_used,
      createdAt: session.created_at,
      userAgent: session.user_agent,
      originDomain: session.origin_domain,
    }))
  }

  /**
   * Extiende la duración de una sesión
   */
  static async extendSession(sessionId: string): Promise<boolean> {
    const session = await Database.getSessionByTokenHash(sessionId)
    if (!session) return false

    const newExpiresAt = new Date(Date.now() + this.SESSION_DURATION)

    const conn = await Database.getConnection()
    try {
      const [result] = await conn.execute("UPDATE sessions SET expires_at = ? WHERE id = ?", [
        newExpiresAt.toISOString().slice(0, 19).replace("T", " "),
        session.id,
      ])
      const updateResult = result as any
      return updateResult.affectedRows > 0
    } finally {
      conn.release()
    }
  }

  /**
   * Limpia sesiones expiradas (debe ejecutarse periódicamente)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    await Database.deleteExpiredSessions()

    const conn = await Database.getConnection()
    try {
      const [result] = await conn.execute("SELECT ROW_COUNT() as count")
      const deleteResult = result as any
      return deleteResult[0]?.count || 0
    } finally {
      conn.release()
    }
  }

  /**
   * Valida el formato de un session ID
   */
  static isValidSessionId(sessionId: string): boolean {
    return /^[a-f0-9]{64}$/.test(sessionId)
  }

  /**
   * Obtiene información de la sesión para mostrar al usuario
   */
  static async getSessionInfo(sessionId: string): Promise<{
    id: string
    deviceInfo?: string
    ipAddress?: string
    lastUsed: string
    createdAt: string
    isCurrent: boolean
  } | null> {
    const session = await Database.getSessionByTokenHash(sessionId)
    if (!session) return null

    return {
      id: session.token_hash, // El session_id está en token_hash
      deviceInfo: session.device_info,
      ipAddress: session.ip_address,
      lastUsed: session.last_used,
      createdAt: session.created_at,
      isCurrent: false, // Se debe establecer externamente
    }
  }

  /**
   * Inicia el proceso de limpieza automática
   */
  static startCleanupProcess(): void {
    setInterval(async () => {
      try {
        const cleaned = await this.cleanupExpiredSessions()
        if (cleaned > 0) {
          console.log(`🧹 Cleaned up ${cleaned} expired sessions`)
        }
      } catch (error) {
        console.error("❌ Error cleaning up sessions:", error)
      }
    }, this.CLEANUP_INTERVAL)
  }
}
