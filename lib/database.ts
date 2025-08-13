import mysql from "mysql2/promise"
import crypto from "crypto"

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "wikipeoplestats",
  timezone: "+00:00",
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 25,
  queueLimit: 0,
})

export interface User {
  id: number
  wikimedia_id: string | null
  username: string
  email?: string
  avatar_url?: string
  is_active: boolean
  is_claimed: boolean
  created_at: string
  updated_at: string
  last_login?: string
  registration_date?: string
}

export interface UserRole {
  id: number
  user_id: number
  role: string
  chapter_id?: number
  created_at: string
}

export interface Session {
  id: number
  user_id: number
  token_hash: string
  expires_at: string
  origin_domain: string
  user_agent?: string
  ip_address?: string
  device_info?: string
  is_active: boolean
  created_at: string
  last_used: string
}

export interface SessionWithUser extends Session {
  username: string
  avatar_url?: string
}

export class Database {
  static async getConnection(): Promise<mysql.PoolConnection> {
    return await pool.getConnection()
  }

  static async initializeTables(): Promise<void> {
    const conn = await this.getConnection()
    try {
      // Actualizar tabla de usuarios para incluir is_claimed
      await conn.execute(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NULL,
        MODIFY COLUMN wikimedia_id VARCHAR(255) NULL
      `)

      // Actualizar tabla de sesiones
      await conn.execute(`
        ALTER TABLE sessions 
        ADD COLUMN IF NOT EXISTS device_info TEXT NULL,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
        ADD INDEX IF NOT EXISTS idx_user_active (user_id, is_active),
        ADD INDEX IF NOT EXISTS idx_expires_active (expires_at, is_active)
      `)

      // Crear tabla de tokens en lista negra si no existe
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS token_blacklist (
          id INT AUTO_INCREMENT PRIMARY KEY,
          token_hash VARCHAR(255) NOT NULL UNIQUE,
          user_id INT NOT NULL,
          reason VARCHAR(255) DEFAULT 'manual_revocation',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_token_hash (token_hash),
          INDEX idx_user_id (user_id),
          INDEX idx_created_at (created_at)
        )
      `)

      // Crear tabla de logs de seguridad si no existe
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS security_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          action VARCHAR(100) NOT NULL,
          details JSON NULL,
          ip_address VARCHAR(45) NULL,
          user_agent TEXT NULL,
          severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_action (action),
          INDEX idx_severity (severity),
          INDEX idx_created_at (created_at)
        )
      `)
    } finally {
      conn.release()
    }
  }

  static async getUserByWikipediaId(wikimediaId: string): Promise<User | null> {
    const conn = await this.getConnection()
    try {
      const [rows] = await conn.execute("SELECT * FROM users WHERE wikimedia_id = ? AND is_active = 1", [wikimediaId])
      const users = rows as User[]
      return users[0] || null
    } finally {
      conn.release()
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const conn = await this.getConnection()
    try {
      const [rows] = await conn.execute("SELECT * FROM users WHERE username = ? AND is_active = 1", [username])
      const users = rows as User[]
      return users[0] || null
    } finally {
      conn.release()
    }
  }

  static async createUser(data: {
    wikimedia_id?: string
    username: string
    email?: string
    avatar_url?: string
    registration_date?: string
    is_claimed?: boolean
  }): Promise<User> {
    const conn = await this.getConnection()
    try {
      // Ensure all optional parameters are properly converted to null if undefined
      const wikimediaId = data.wikimedia_id ?? null
      const email = data.email ?? null
      const avatarUrl = data.avatar_url ?? null
      const registrationDate = data.registration_date ?? null
      const isClaimed = data.is_claimed ?? false

      const [result] = await conn.execute(
        `INSERT INTO users (wikimedia_id, username, email, avatar_url, registration_date, is_claimed, created_at, updated_at, is_active)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), 1)`,
        [wikimediaId, data.username, email, avatarUrl, registrationDate, isClaimed],
      )
      const insertResult = result as mysql.ResultSetHeader
      const user = await this.getUserById(insertResult.insertId)
      if (!user) {
        throw new Error("User creation failed")
      }
      return user
    } finally {
      conn.release()
    }
  }

  static async claimUserAccount(userId: number, wikimediaId: string, email?: string): Promise<User | null> {
    const conn = await this.getConnection()
    try {
      const emailValue = email ?? null
      await conn.execute(
        `UPDATE users 
         SET wikimedia_id = ?, email = COALESCE(?, email), is_claimed = TRUE, updated_at = NOW()
         WHERE id = ?`,
        [wikimediaId, emailValue, userId],
      )
      return await this.getUserById(userId)
    } finally {
      conn.release()
    }
  }

  static async getUserById(id: number): Promise<User | null> {
    const conn = await this.getConnection()
    try {
      const [rows] = await conn.execute("SELECT * FROM users WHERE id = ?", [id])
      const users = rows as User[]
      return users[0] || null
    } finally {
      conn.release()
    }
  }

  static async updateUserLogin(userId: number): Promise<void> {
    const conn = await this.getConnection()
    try {
      await conn.execute("UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = ?", [userId])
    } finally {
      conn.release()
    }
  }

  static async assignDefaultRole(userId: number, roleId = 1): Promise<void> {
    const conn = await this.getConnection()
    try {
      await conn.execute(
        `INSERT INTO user_roles (user_id, role_id, created_at)
         VALUES (?, ?, NOW())`,
        [userId, roleId],
      )
    } finally {
      conn.release()
    }
  }

  static async createSession(data: {
    user_id: number
    token_hash: string
    expires_at: string
    origin_domain: string
    user_agent?: string
    ip_address?: string
    device_info?: string
  }): Promise<Session> {
    const conn = await this.getConnection()
    try {
      // Use nullish coalescing operator to ensure proper null values
      const userAgent = data.user_agent ?? null
      const ipAddress = data.ip_address ?? null
      const deviceInfo = data.device_info ?? null

      const [result] = await conn.execute(
        `INSERT INTO sessions (user_id, token_hash, expires_at, origin_domain, user_agent, ip_address, device_info, is_active, created_at, last_used)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
        [data.user_id, data.token_hash, data.expires_at, data.origin_domain, userAgent, ipAddress, deviceInfo],
      )
      const insertResult = result as mysql.ResultSetHeader
      const session = await this.getSessionById(insertResult.insertId)
      if (!session) {
        throw new Error("Session creation failed")
      }
      return session
    } finally {
      conn.release()
    }
  }

  static async getSessionById(id: number): Promise<Session | null> {
    const conn = await this.getConnection()
    try {
      const [rows] = await conn.execute("SELECT * FROM sessions WHERE id = ?", [id])
      const sessions = rows as Session[]
      return sessions[0] || null
    } finally {
      conn.release()
    }
  }

  static async getSessionByTokenHash(tokenHash: string): Promise<Session | null> {
    const conn = await this.getConnection()
    try {
      const [rows] = await conn.execute(
        "SELECT * FROM sessions WHERE token_hash = ? AND is_active = TRUE AND expires_at > NOW()",
        [tokenHash],
      )
      const sessions = rows as Session[]
      return sessions[0] || null
    } finally {
      conn.release()
    }
  }

  static async getUserActiveSessions(userId: number): Promise<SessionWithUser[]> {
    const conn = await this.getConnection()
    try {
      const [rows] = await conn.execute(
        `SELECT s.*, u.username, u.avatar_url
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.user_id = ? AND s.is_active = TRUE AND s.expires_at > NOW()
         ORDER BY s.last_used DESC`,
        [userId],
      )
      return rows as SessionWithUser[]
    } finally {
      conn.release()
    }
  }

  static async updateSessionLastUsed(sessionId: number): Promise<void> {
    const conn = await this.getConnection()
    try {
      await conn.execute("UPDATE sessions SET last_used = NOW() WHERE id = ?", [sessionId])
    } finally {
      conn.release()
    }
  }

  static async revokeSession(sessionId: number, userId?: number): Promise<boolean> {
    const conn = await this.getConnection()
    try {
      let query = "UPDATE sessions SET is_active = FALSE WHERE id = ?"
      const params: any[] = [sessionId]

      if (userId) {
        query += " AND user_id = ?"
        params.push(userId)
      }

      const [result] = await conn.execute(query, params)
      const updateResult = result as mysql.ResultSetHeader
      return updateResult.affectedRows > 0
    } finally {
      conn.release()
    }
  }

  static async revokeAllUserSessions(userId: number, exceptSessionId?: number): Promise<number> {
    const conn = await this.getConnection()
    try {
      let query = "UPDATE sessions SET is_active = FALSE WHERE user_id = ?"
      const params: any[] = [userId]

      if (exceptSessionId) {
        query += " AND id != ?"
        params.push(exceptSessionId)
      }

      const [result] = await conn.execute(query, params)
      const updateResult = result as mysql.ResultSetHeader
      return updateResult.affectedRows
    } finally {
      conn.release()
    }
  }

  static async deleteExpiredSessions(): Promise<void> {
    const conn = await this.getConnection()
    try {
      await conn.execute("DELETE FROM sessions WHERE expires_at < NOW()")
    } finally {
      conn.release()
    }
  }

  static async getSessionStats(userId: number): Promise<{
    total_sessions: number
    active_sessions: number
    devices: string[]
    last_login_ip: string | null
  }> {
    const conn = await this.getConnection()
    try {
      const [totalRows] = await conn.execute("SELECT COUNT(*) as count FROM sessions WHERE user_id = ?", [userId])
      const [activeRows] = await conn.execute(
        "SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()",
        [userId],
      )
      const [deviceRows] = await conn.execute(
        "SELECT DISTINCT device_info FROM sessions WHERE user_id = ? AND device_info IS NOT NULL",
        [userId],
      )
      const [lastIpRows] = await conn.execute(
        "SELECT ip_address FROM sessions WHERE user_id = ? ORDER BY last_used DESC LIMIT 1",
        [userId],
      )

      const total = (totalRows as any)[0].count
      const active = (activeRows as any)[0].count
      const devices = (deviceRows as any[]).map((row) => row.device_info).filter(Boolean)
      const lastIp = (lastIpRows as any)[0]?.ip_address || null

      return {
        total_sessions: total,
        active_sessions: active,
        devices,
        last_login_ip: lastIp,
      }
    } finally {
      conn.release()
    }
  }

  static async blacklistToken(tokenHash: string, userId: number, reason = "manual_revocation"): Promise<void> {
    const conn = await this.getConnection()
    try {
      await conn.execute(
        `INSERT INTO token_blacklist (token_hash, user_id, reason, created_at) 
         VALUES (?, ?, ?, NOW()) 
         ON DUPLICATE KEY UPDATE reason = VALUES(reason)`,
        [tokenHash, userId, reason],
      )
    } finally {
      conn.release()
    }
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const conn = await this.getConnection()
    try {
      const tokenHash = this.hashToken(token)
      const [rows] = await conn.execute("SELECT 1 FROM token_blacklist WHERE token_hash = ?", [tokenHash])
      return (rows as any[]).length > 0
    } finally {
      conn.release()
    }
  }

  static async getUserActiveSessionsExcept(userId: number, exceptSessionId?: number): Promise<Session[]> {
    const conn = await this.getConnection()
    try {
      let query = `SELECT * FROM sessions 
                   WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()`
      const params: any[] = [userId]

      if (exceptSessionId) {
        query += " AND id != ?"
        params.push(exceptSessionId)
      }

      query += " ORDER BY last_used DESC"

      const [rows] = await conn.execute(query, params)
      return rows as Session[]
    } finally {
      conn.release()
    }
  }

  static async cleanupExpiredTokens(): Promise<void> {
    const conn = await this.getConnection()
    try {
      // Remove blacklisted tokens older than 30 days
      await conn.execute("DELETE FROM token_blacklist WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)")

      // Remove expired sessions
      await conn.execute("DELETE FROM sessions WHERE expires_at < NOW()")
    } finally {
      conn.release()
    }
  }

  // Helper method to hash tokens consistently
  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }

  // Log security events
  static async logSecurityEvent(data: {
    user_id?: number
    action: string
    details?: any
    ip_address?: string
    user_agent?: string
    severity?: "low" | "medium" | "high" | "critical"
  }): Promise<void> {
    const conn = await this.getConnection()
    try {
      await conn.execute(
        `INSERT INTO security_logs (user_id, action, details, ip_address, user_agent, severity, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.user_id || null,
          data.action,
          data.details ? JSON.stringify(data.details) : null,
          data.ip_address || null,
          data.user_agent || null,
          data.severity || "medium",
        ],
      )
    } finally {
      conn.release()
    }
  }
}

// Export the getConnection function for backward compatibility
export async function getConnection(): Promise<mysql.PoolConnection> {
  return await Database.getConnection()
}

// Export getDatabase function for auth middleware compatibility
export async function getDatabase(): Promise<mysql.PoolConnection> {
  return await Database.getConnection()
}
