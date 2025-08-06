// lib/session-manager.ts
import { Database } from './database'
import crypto from 'crypto'

export interface SessionData {
  id: number
  user_id: number
  session_token: string
  expires_at: string
  origin_domain: string
  user_agent?: string
  ip_address?: string
  device_info?: string
  is_active: boolean
  created_at: string
  last_used: string
}

export interface UserSession extends SessionData {
  username: string
  email?: string
  avatar_url?: string
  roles: string[]
  chapter_id?: number
}

export class SessionManager {
  private static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 días
  private static readonly CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hora

  // Generar token de sesión seguro
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  // Crear nueva sesión
  static async createSession(data: {
    user_id: number
    origin_domain: string
    user_agent?: string
    ip_address?: string
    device_info?: string
  }): Promise<string> {
    const conn = await Database.getConnection()
    
    try {
      const sessionToken = this.generateSessionToken()
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION)

      await conn.execute(`
        INSERT INTO sessions (
          user_id, session_token, expires_at, origin_domain, 
          user_agent, ip_address, device_info, is_active, 
          created_at, last_used
        ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())
      `, [
        data.user_id,
        sessionToken,
        expiresAt,
        data.origin_domain,
        data.user_agent || null,
        data.ip_address || null,
        data.device_info || null
      ])

      return sessionToken
    } finally {
      conn.release()
    }
  }

  static async getSessionWithUser(sessionToken: string): Promise<UserSession | null> {
    const conn = await Database.getConnection()
    console.log("🔍 Validating token:", sessionToken)
    
    try {
      const [rows] = await conn.execute(`
        SELECT 
          s.*,
          u.username,
          u.email,
          u.avatar_url,
          GROUP_CONCAT(DISTINCT r.name) as roles,
          ur.chapter_id
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN roles r ON r.id = ur.role_id AND r.is_active = 1
        WHERE s.session_token = ? 
          AND s.is_active = TRUE 
          AND s.expires_at > NOW()
          AND u.is_active = 1
        GROUP BY s.id
        LIMIT 1
      `, [sessionToken])

      console.log("📊 Query results:", rows)
      const sessions = rows as any[]
      if (sessions.length === 0) {
        console.log("❌ No active session found for token")
        return null
      }

      const session = sessions[0]
      return {
        ...session,
        roles: session.roles ? session.roles.split(',') : []
      }
    } catch (error) {
      console.error("❌ Error in getSessionWithUser:", error)
      return null
    } finally {
      conn.release()
    }
  }

  // Validar sesión y actualizar última actividad
  static async validateSession(sessionToken: string): Promise<UserSession | null> {
    const session = await this.getSessionWithUser(sessionToken)
    
    if (!session) return null

    // Actualizar última actividad
    await this.updateLastUsed(session.id)
    
    return session
  }

  // Actualizar última actividad de la sesión
  static async updateLastUsed(sessionId: number): Promise<void> {
    const conn = await Database.getConnection()
    
    try {
      await conn.execute(`
        UPDATE sessions 
        SET last_used = NOW() 
        WHERE id = ?
      `, [sessionId])
    } finally {
      conn.release()
    }
  }

  // Cerrar sesión específica
  static async revokeSession(sessionToken: string): Promise<boolean> {
    const conn = await Database.getConnection()
    
    try {
      const [result] = await conn.execute(`
        UPDATE sessions 
        SET is_active = FALSE 
        WHERE session_token = ?
      `, [sessionToken])

      const updateResult = result as any
      return updateResult.affectedRows > 0
    } finally {
      conn.release()
    }
  }

  // Cerrar todas las sesiones de un usuario excepto la actual
  static async revokeAllUserSessionsExcept(userId: number, currentSessionToken?: string): Promise<number> {
    const conn = await Database.getConnection()
    
    try {
      let query = `UPDATE sessions SET is_active = FALSE WHERE user_id = ?`
      const params: any[] = [userId]

      if (currentSessionToken) {
        query += ` AND session_token != ?`
        params.push(currentSessionToken)
      }

      const [result] = await conn.execute(query, params)
      const updateResult = result as any
      return updateResult.affectedRows
    } finally {
      conn.release()
    }
  }

  // Obtener todas las sesiones activas de un usuario
  static async getUserActiveSessions(userId: number): Promise<SessionData[]> {
    const conn = await Database.getConnection()
    
    try {
      const [rows] = await conn.execute(`
        SELECT * FROM sessions 
        WHERE user_id = ? 
          AND is_active = TRUE 
          AND expires_at > NOW()
        ORDER BY last_used DESC
      `, [userId])

      return rows as SessionData[]
    } finally {
      conn.release()
    }
  }

  // Limpiar sesiones expiradas
  static async cleanupExpiredSessions(): Promise<number> {
    const conn = await Database.getConnection()
    
    try {
      const [result] = await conn.execute(`
        DELETE FROM sessions 
        WHERE expires_at < NOW() OR is_active = FALSE
      `)

      const deleteResult = result as any
      return deleteResult.affectedRows
    } finally {
      conn.release()
    }
  }

  // Verificar si un usuario tiene un rol específico
  static async userHasRole(userId: number, roleName: string, chapterId?: number): Promise<boolean> {
    const conn = await Database.getConnection()
    
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = ? AND r.is_active = 1
      `
      const params: any[] = [userId, roleName]

      if (chapterId) {
        query += ` AND ur.chapter_id = ?`
        params.push(chapterId)
      }

      const [rows] = await conn.execute(query, params)
      const result = rows as any[]
      return result[0].count > 0
    } finally {
      conn.release()
    }
  }

  // Verificar si un usuario tiene cualquiera de varios roles
  static async userHasAnyRole(userId: number, roleNames: string[], chapterId?: number): Promise<boolean> {
    const conn = await Database.getConnection()
    
    try {
      const placeholders = roleNames.map(() => '?').join(',')
      let query = `
        SELECT COUNT(*) as count
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name IN (${placeholders}) AND r.is_active = 1
      `
      const params: any[] = [userId, ...roleNames]

      if (chapterId) {
        query += ` AND ur.chapter_id = ?`
        params.push(chapterId)
      }

      const [rows] = await conn.execute(query, params)
      const result = rows as any[]
      return result[0].count > 0
    } finally {
      conn.release()
    }
  }

  // Inicializar limpieza automática de sesiones
  static initializeCleanup(): void {
    setInterval(async () => {
      try {
        const cleaned = await this.cleanupExpiredSessions()
        if (cleaned > 0) {
          console.log(`🧹 Cleaned up ${cleaned} expired sessions`)
        }
      } catch (error) {
        console.error('❌ Error cleaning up sessions:', error)
      }
    }, this.CLEANUP_INTERVAL)
  }
}