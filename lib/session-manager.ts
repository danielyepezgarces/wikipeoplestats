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
  lastActivity: Date
  ipAddress?: string
  userAgent?: string
  deviceInfo?: string
  origin?: string
}

export interface SessionMetadata {
  origin?: string
  userAgent?: string
  ipAddress?: string
  deviceInfo?: string
}

export class SessionManager {
  private static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 días
  private static readonly CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hora
  private static cleanupTimer: NodeJS.Timeout | null = null

  /**
   * Genera un session ID compacto y seguro (22 caracteres)
   */
  private static generateSessionId(): string {
    // 16 bytes = 128 bits de entropía, convertido a base64url = 22 caracteres
    const bytes = crypto.randomBytes(16)
    return bytes.toString("base64url")
  }

  /**
   * Valida el formato de un session ID
   */
  static isValidSessionId(sessionId: string): boolean {
    // Debe ser exactamente 22 caracteres base64url
    return /^[A-Za-z0-9_-]{22}$/.test(sessionId)
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

    // Detectar OS
    if (ua.includes("windows")) os = "Windows"
    else if (ua.includes("mac")) os = "macOS"
    else if (ua.includes("linux")) os = "Linux"
    else if (ua.includes("android")) os = "Android"
    else if (ua.includes("ios")) os = "iOS"

    return `${device} - ${browser} on ${os}`
  }

  /**
   * Crea una nueva sesión para un usuario
   */
  static async createSession(user: any, metadata: SessionMetadata = {}): Promise<string> {
    const sessionId = this.generateSessionId()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.SESSION_DURATION)

    try {
      await Database.createSession({
        user_id: user.id,
        token_hash: sessionId,
        expires_at: expiresAt.toISOString().slice(0, 19).replace("T", " "),
        origin_domain: metadata.origin,
        user_agent: metadata.userAgent,
        ip_address: metadata.ipAddress,
        device_info: metadata.deviceInfo || this.parseDeviceInfo(metadata.userAgent || ""),
      })

      console.log(`✅ Session created: ${sessionId} for user ${user.username}`)
      return sessionId
    } catch (error) {
      console.error("❌ Error creating session:", error)
      throw new Error("Failed to create session")
    }
  }

  /**
   * Obtiene los datos de una sesión
   */
  static async getSession(sessionId: string): Promise<SessionData | null> {
    if (!this.isValidSessionId(sessionId)) {
      return null
    }

    try {
      const sessions = await Database.query(
        `SELECT s.*, u.username, u.email 
         FROM sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.id = ? AND s.expires_at > NOW()`,
        [sessionId],
      )

      if (sessions.length === 0) {
        return null
      }

      const session = sessions[0]

      // Actualizar última actividad
      await this.updateLastActivity(sessionId)

      return {
        id: session.id,
        userId: session.user_id,
        username: session.username,
        email: session.email,
        createdAt: new Date(session.created_at),
        expiresAt: new Date(session.expires_at),
        lastActivity: new Date(session.last_activity),
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        deviceInfo: session.device_info,
        origin: session.origin,
      }
    } catch (error) {
      console.error("❌ Error getting session:", error)
      return null
    }
  }

  /**
   * Actualiza la última actividad de una sesión
   */
  static async updateLastActivity(sessionId: string): Promise<void> {
    try {
      await Database.query("UPDATE sessions SET last_activity = NOW() WHERE id = ?", [sessionId])
    } catch (error) {
      console.error("❌ Error updating last activity:", error)
    }
  }

  /**
   * Revoca una sesión específica
   */
  static async revokeSession(sessionId: string): Promise<boolean> {
    try {
      const result = await Database.query("DELETE FROM sessions WHERE id = ?", [sessionId])
      console.log(`🗑️ Session revoked: ${sessionId}`)
      return result.affectedRows > 0
    } catch (error) {
      console.error("❌ Error revoking session:", error)
      return false
    }
  }

  /**
   * Revoca todas las sesiones de un usuario excepto la actual
   */
  static async revokeAllUserSessions(userId: number, exceptSessionId?: string): Promise<number> {
    try {
      let query = "DELETE FROM sessions WHERE user_id = ?"
      const params: any[] = [userId]

      if (exceptSessionId) {
        query += " AND id != ?"
        params.push(exceptSessionId)
      }

      const result = await Database.query(query, params)
      console.log(`🗑️ Revoked ${result.affectedRows} sessions for user ${userId}`)
      return result.affectedRows
    } catch (error) {
      console.error("❌ Error revoking user sessions:", error)
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
         WHERE s.user_id = ? AND s.expires_at > NOW() 
         ORDER BY s.last_activity DESC`,
        [userId],
      )

      return sessions.map((session: any) => ({
        id: session.id,
        userId: session.user_id,
        username: session.username,
        email: session.email,
        createdAt: new Date(session.created_at),
        expiresAt: new Date(session.expires_at),
        lastActivity: new Date(session.last_activity),
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        deviceInfo: session.device_info,
        origin: session.origin,
      }))
    } catch (error) {
      console.error("❌ Error getting user sessions:", error)
      return []
    }
  }

  /**
   * Limpia sesiones expiradas
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await Database.query("DELETE FROM sessions WHERE expires_at <= NOW()")
      const deletedCount = result.affectedRows
      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} expired sessions`)
      }
      return deletedCount
    } catch (error) {
      console.error("❌ Error cleaning up sessions:", error)
      return 0
    }
  }

  /**
   * Inicia el proceso automático de limpieza de sesiones
   */
  static startCleanupProcess(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(async () => {
      await this.cleanupExpiredSessions()
    }, this.CLEANUP_INTERVAL)

    console.log("🔄 Session cleanup process started")
  }

  /**
   * Detiene el proceso de limpieza
   */
  static stopCleanupProcess(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
      console.log("⏹️ Session cleanup process stopped")
    }
  }

  /**
   * Obtiene estadísticas de sesiones
   */
  static async getSessionStats(): Promise<{
    total: number
    active: number
    expired: number
    byDevice: Record<string, number>
  }> {
    try {
      const [totalResult, activeResult, expiredResult, deviceResult] = await Promise.all([
        Database.query("SELECT COUNT(*) as count FROM sessions"),
        Database.query("SELECT COUNT(*) as count FROM sessions WHERE expires_at > NOW()"),
        Database.query("SELECT COUNT(*) as count FROM sessions WHERE expires_at <= NOW()"),
        Database.query(`
          SELECT device_info, COUNT(*) as count 
          FROM sessions 
          WHERE expires_at > NOW() AND device_info IS NOT NULL 
          GROUP BY device_info
        `),
      ])

      const byDevice: Record<string, number> = {}
      deviceResult.forEach((row: any) => {
        byDevice[row.device_info] = row.count
      })

      return {
        total: totalResult[0].count,
        active: activeResult[0].count,
        expired: expiredResult[0].count,
        byDevice,
      }
    } catch (error) {
      console.error("❌ Error getting session stats:", error)
      return { total: 0, active: 0, expired: 0, byDevice: {} }
    }
  }
}
