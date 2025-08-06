import mysql from "mysql2/promise"

export const runtime = 'nodejs' // Add this to your route file

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

export interface TokenBlacklist {
  id: number
  token_hash: string
  user_id: number
  revoked_at: string
  expires_at: string
  reason: string
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

      // Actualizar tabla de sesiones para el nuevo sistema
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          session_token VARCHAR(64) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          origin_domain VARCHAR(255) NOT NULL,
          user_agent TEXT NULL,
          ip_address VARCHAR(45) NULL,
          device_info TEXT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_session_token (session_token),
          INDEX idx_user_active (user_id, is_active),
          INDEX idx_expires_active (expires_at, is_active),
          INDEX idx_user_expires (user_id, expires_at),
          INDEX idx_active_expires (is_active, expires_at),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)

      // Crear tabla de logs de sesiones para auditoría
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS session_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          session_id INT NOT NULL,
          user_id INT NOT NULL,
          action ENUM('created', 'validated', 'revoked', 'expired') NOT NULL,
          ip_address VARCHAR(45) NULL,
          user_agent TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_session_id (session_id),
          INDEX idx_user_id (user_id),
          INDEX idx_action (action),
          INDEX idx_created_at (created_at),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
      const wikimediaId = data.wikimedia_id || null
      const email = data.email || null
      const avatarUrl = data.avatar_url || null
      const registrationDate = data.registration_date || null
      const isClaimed = data.is_claimed !== undefined ? data.is_claimed : false

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
      const emailValue = email || null
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
    session_token: string
    expires_at: string
    origin_domain: string
    user_agent?: string
    ip_address?: string
    device_info?: string
  }): Promise<Session> {
    const conn = await this.getConnection()
    try {
      const userAgent = data.user_agent || null
      const ipAddress = data.ip_address || null
      const deviceInfo = data.device_info || null

      const [result] = await conn.execute(
        `INSERT INTO sessions (user_id, session_token, expires_at, origin_domain, user_agent, ip_address, device_info, is_active, created_at, last_used)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
        [data.user_id, data.session_token, data.expires_at, data.origin_domain, userAgent, ipAddress, deviceInfo],
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

  static async getSessionByToken(sessionToken: string): Promise<Session | null> {
    const conn = await this.getConnection()
    try {
      const [rows] = await conn.execute(
        "SELECT * FROM sessions WHERE session_token = ? AND is_active = TRUE AND expires_at > NOW()",
        [sessionToken],
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

  static async getUserActiveSessionsExcept(userId: number, exceptSessionId: number | null): Promise<Session[]> {
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

  // Session Logging Methods
  static async logSessionAction(
    sessionId: number, 
    userId: number, 
    action: 'created' | 'validated' | 'revoked' | 'expired',
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const conn = await this.getConnection()
    try {
      await conn.execute(
        `INSERT INTO session_logs (session_id, user_id, action, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?)`,
        [sessionId, userId, action, ipAddress || null, userAgent || null],
      )
    } finally {
      conn.release()
    }
  }

  static async getSessionLogs(userId?: number, limit = 100): Promise<any[]> {
    const conn = await this.getConnection()
    try {
      let query = `
        SELECT sl.*, u.username 
        FROM session_logs sl
        JOIN users u ON sl.user_id = u.id
      `
      const params: any[] = []

      if (userId) {
        query += ` WHERE sl.user_id = ?`
        params.push(userId)
      }

      query += ` ORDER BY sl.created_at DESC LIMIT ?`
      params.push(limit)

      const [rows] = await conn.execute(query, params)
      return rows as any[]
    } finally {
      conn.release()
    }
  }

  static async cleanupOldSessionLogs(daysToKeep = 90): Promise<number> {
    const conn = await this.getConnection()
    try {
      const [result] = await conn.execute(
        "DELETE FROM session_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)",
        [daysToKeep]
      )
      const deleteResult = result as any
      return deleteResult.affectedRows
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
}

// Export the getConnection function for backward compatibility
export async function getConnection(): Promise<mysql.PoolConnection> {
  return await Database.getConnection()
}