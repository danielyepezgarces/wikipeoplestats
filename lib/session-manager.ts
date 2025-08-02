import crypto from "crypto"
import { Database } from "./database"

export interface SessionData {
  id: string
  userId: number
  username: string
  email?: string
  roles?: string[]
  createdAt: Date
  expiresAt: Date
  lastUsed: Date
  origin: string
  userAgent?: string
  ipAddress?: string
  deviceInfo?: string
  isActive: boolean
}

export interface CreateSessionOptions {
  origin: string
  userAgent?: string
  ipAddress?: string
  deviceInfo?: string
  expiresInDays?: number
}

export class SessionManager {
  private static readonly SESSION_DURATION_DAYS = 30
  private static readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000 // 1 hora

  /**
   * Genera un session ID único y seguro
   */
  private static generateSessionId(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  /**
   * Crea una nueva sesión del servidor
   */
  static async createSession(user: any, options: CreateSessionOptions): Promise<string> {
    const sessionId = this.generateSessionId()
    const expiresInDays = options.expiresInDays || this.SESSION_DURATION_DAYS
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    await Database.createSession({
      user_id: user.id,
      token_hash: sessionId, // Reutilizamos el campo token_hash para el session ID
      expires_at: expiresAt.toISOString().slice(0, 19).replace("T", " "),
      origin_domain: options.origin,
      user_agent: options.userAgent,
      ip_address: options.ipAddress,
      device_info: options.deviceInfo || this.parseDeviceInfo(options.userAgent || ""),
    })

    return sessionId
  }

  /**
   * Verifica y obtiene una sesión por su ID
   */
  static async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessions = await Database.query(
        `SELECT s.*, u.username, u.email 
         FROM sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.token_hash = ? AND s.is_active = 1 AND s.expires_at > NOW()`,
        [sessionId],
      )

      if (sessions.length === 0) {
        return null
      }

      const session = sessions[0]

      // Actualizar último uso
      await this.updateLastUsed(sessionId)

      return {
        id: session.token_hash,
        userId: session.user_id,
        username: session.username,
        email: session.email,
        createdAt: new Date(session.created_at),
        expiresAt: new Date(session.expires_at),
        lastUsed: new Date(session.last_used),
        origin: session.origin_domain,
        userAgent: session.user_agent,
        ipAddress: session.ip_address,
        deviceInfo: session.device_info,
        isActive: session.is_active === 1,
      }
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  }

  /**
   * Actualiza el último uso de una sesión
   */
  static async updateLastUsed(sessionId: string): Promise<void> {
    try {
      await Database.query("UPDATE sessions SET last_used = NOW() WHERE token_hash = ?", [sessionId])
    } catch (error) {
      console.error("Error updating last used:", error)
    }
  }

  /**
   * Invalida una sesión específica
   */
  static async revokeSession(sessionId: string, userId?: number): Promise<boolean> {
    try {
      const query = userId
        ? "UPDATE sessions SET is_active = 0 WHERE token_hash = ? AND user_id = ?"
        : "UPDATE sessions SET is_active = 0 WHERE token_hash = ?"

      const params = userId ? [sessionId, userId] : [sessionId]
      const result = await Database.query(query, params)

      return result.affectedRows > 0
    } catch (error) {
      console.error("Error revoking session:", error)
      return false
    }
  }

  /**
   * Invalida todas las sesiones de un usuario excepto la actual
   */
  static async revokeAllUserSessions(userId: number, exceptSessionId?: string): Promise<number> {
    try {
      const query = exceptSessionId
        ? "UPDATE sessions SET is_active = 0 WHERE user_id = ? AND token_hash != ?"
        : "UPDATE sessions SET is_active = 0 WHERE user_id = ?"

      const params = exceptSessionId ? [userId, exceptSessionId] : [userId]
      const result = await Database.query(query, params)

      return result.affectedRows
    } catch (error) {
      console.error("Error revoking user sessions:", error)
      return 0
    }
  }

  /**
   * Obtiene todas las sesiones activas de un usuario
   */
  static async getUserSessions(userId: number): Promise<SessionData[]> {
    try {
      const sessions = await Database.query(
        `SELECT s.*, u.username, u.email 
         FROM sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.user_id = ? AND s.is_active = 1 AND s.expires_at > NOW()
         ORDER BY s.last_used DESC`,
        [userId],
      )

      return sessions.map((session: any) => ({
        id: session.token_hash,
        userId: session.user_id,
        username: session.username,
        email: session.email,
        createdAt: new Date(session.created_at),
        expiresAt: new Date(session.expires_at),
        lastUsed: new Date(session.last_used),
        origin: session.origin_domain,
        userAgent: session.user_agent,
        ipAddress: session.ip_address,
        deviceInfo: session.device_info,
        isActive: session.is_active === 1,
      }))
    } catch (error) {
      console.error("Error getting user sessions:", error)
      return []
    }
  }

  /**
   * Limpia sesiones expiradas
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await Database.query("DELETE FROM sessions WHERE expires_at < NOW() OR is_active = 0")

      console.log(`🧹 Cleaned up ${result.affectedRows} expired sessions`)
      return result.affectedRows
    } catch (error) {
      console.error("Error cleaning up sessions:", error)
      return 0
    }
  }

  /**
   * Inicia el proceso de limpieza automática
   */
  static startCleanupProcess(): void {
    // Limpieza inicial
    this.cleanupExpiredSessions()

    // Programar limpiezas periódicas
    setInterval(() => {
      this.cleanupExpiredSessions()
    }, this.CLEANUP_INTERVAL_MS)

    console.log("🔄 Session cleanup process started")
  }

  /**
   * Extiende la expiración de una sesión
   */
  static async extendSession(sessionId: string, days = 30): Promise<boolean> {
    try {
      const newExpiresAt = new Date()
      newExpiresAt.setDate(newExpiresAt.getDate() + days)

      const result = await Database.query("UPDATE sessions SET expires_at = ? WHERE token_hash = ? AND is_active = 1", [
        newExpiresAt.toISOString().slice(0, 19).replace("T", " "),
        sessionId,
      ])

      return result.affectedRows > 0
    } catch (error) {
      console.error("Error extending session:", error)
      return false
    }
  }

  /**
   * Parsea información del dispositivo desde el User-Agent
   */
  private static parseDeviceInfo(userAgent: string): string {
    const ua = userAgent.toLowerCase()
    let device = "Desktop"
    let browser = "Unknown"
    let os = "Unknown"

    // Detectar dispositivo
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      device = "Mobile"
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      device = "Tablet"
    }

    // Detectar navegador
    if (ua.includes("chrome")) browser = "Chrome"
    else if (ua.includes("firefox")) browser = "Firefox"
    else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari"
    else if (ua.includes("edge")) browser = "Edge"
    else if (ua.includes("opera")) browser = "Opera"

    // Detectar OS
    if (ua.includes("windows")) os = "Windows"
    else if (ua.includes("mac")) os = "macOS"
    else if (ua.includes("linux")) os = "Linux"
    else if (ua.includes("android")) os = "Android"
    else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) os = "iOS"

    return `${device} - ${browser} on ${os}`
  }

  /**
   * Obtiene estadísticas de sesiones de un usuario
   */
  static async getSessionStats(userId: number): Promise<{
    totalSessions: number
    activeSessions: number
    expiredSessions: number
    devicesUsed: string[]
  }> {
    try {
      const [totalResult, activeResult, expiredResult, devicesResult] = await Promise.all([
        Database.query("SELECT COUNT(*) as count FROM sessions WHERE user_id = ?", [userId]),
        Database.query(
          "SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND is_active = 1 AND expires_at > NOW()",
          [userId],
        ),
        Database.query(
          "SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND (is_active = 0 OR expires_at <= NOW())",
          [userId],
        ),
        Database.query("SELECT DISTINCT device_info FROM sessions WHERE user_id = ? AND device_info IS NOT NULL", [
          userId,
        ]),
      ])

      return {
        totalSessions: totalResult[0]?.count || 0,
        activeSessions: activeResult[0]?.count || 0,
        expiredSessions: expiredResult[0]?.count || 0,
        devicesUsed: devicesResult.map((row: any) => row.device_info).filter(Boolean),
      }
    } catch (error) {
      console.error("Error getting session stats:", error)
      return {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
        devicesUsed: [],
      }
    }
  }
}
