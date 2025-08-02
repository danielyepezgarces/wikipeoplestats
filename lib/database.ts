import mysql from "mysql2/promise"

export interface User {
  id: number
  wikimedia_id?: string
  username: string
  email?: string
  avatar_url?: string
  registration_date?: string
  is_claimed: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface CreateUserData {
  wikimedia_id?: string
  username: string
  email?: string
  avatar_url?: string
  registration_date?: string
  is_claimed?: boolean
}

export interface CreateSessionData {
  user_id: number
  token_hash: string
  expires_at: string
  origin_domain: string
  user_agent?: string
  ip_address?: string
  device_info?: string
}

export class Database {
  private static connection: mysql.Connection | null = null

  static async getConnection(): Promise<mysql.Connection> {
    if (!this.connection) {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "wikipeoplestats",
        charset: "utf8mb4",
      })
    }
    return this.connection
  }

  static async query(sql: string, params: any[] = []): Promise<any> {
    const connection = await this.getConnection()
    const [rows] = await connection.execute(sql, params)
    return rows
  }

  static async initializeTables(): Promise<void> {
    const connection = await this.getConnection()

    // Actualizar tabla sessions para el nuevo sistema
    await connection.execute(`
      ALTER TABLE sessions 
      MODIFY COLUMN token_hash VARCHAR(64) NOT NULL COMMENT 'Session ID (64 hex chars) or JWT hash for legacy sessions',
      ADD INDEX IF NOT EXISTS idx_token_hash (token_hash),
      ADD INDEX IF NOT EXISTS idx_user_active (user_id, is_active),
      ADD INDEX IF NOT EXISTS idx_expires (expires_at)
    `)

    console.log("✅ Database tables initialized/updated for server sessions")
  }

  // Métodos de usuario
  static async getUserById(id: number): Promise<User | null> {
    const users = await this.query("SELECT * FROM users WHERE id = ?", [id])
    return users.length > 0 ? users[0] : null
  }

  static async getUserByWikipediaId(wikimediaId: string): Promise<User | null> {
    const users = await this.query("SELECT * FROM users WHERE wikimedia_id = ?", [wikimediaId])
    return users.length > 0 ? users[0] : null
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.query("SELECT * FROM users WHERE username = ?", [username])
    return users.length > 0 ? users[0] : null
  }

  static async createUser(userData: CreateUserData): Promise<User | null> {
    try {
      const result = await this.query(
        `INSERT INTO users (wikimedia_id, username, email, avatar_url, registration_date, is_claimed, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userData.wikimedia_id || null,
          userData.username,
          userData.email || null,
          userData.avatar_url || null,
          userData.registration_date || null,
          userData.is_claimed || false,
        ],
      )

      return await this.getUserById(result.insertId)
    } catch (error) {
      console.error("Error creating user:", error)
      return null
    }
  }

  static async claimUserAccount(userId: number, wikimediaId: string, email?: string): Promise<User | null> {
    try {
      await this.query(
        "UPDATE users SET wikimedia_id = ?, email = ?, is_claimed = 1, updated_at = NOW() WHERE id = ?",
        [wikimediaId, email || null, userId],
      )

      return await this.getUserById(userId)
    } catch (error) {
      console.error("Error claiming user account:", error)
      return null
    }
  }

  static async updateUserLogin(userId: number): Promise<void> {
    try {
      await this.query("UPDATE users SET last_login = NOW() WHERE id = ?", [userId])
    } catch (error) {
      console.error("Error updating user login:", error)
    }
  }

  // Métodos de sesión
  static async createSession(sessionData: CreateSessionData): Promise<void> {
    await this.query(
      `INSERT INTO sessions (user_id, token_hash, expires_at, origin_domain, user_agent, ip_address, device_info, is_active, created_at, last_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        sessionData.user_id,
        sessionData.token_hash,
        sessionData.expires_at,
        sessionData.origin_domain,
        sessionData.user_agent || null,
        sessionData.ip_address || null,
        sessionData.device_info || null,
      ],
    )
  }

  static async getSessionByToken(tokenHash: string): Promise<any | null> {
    const sessions = await this.query(
      "SELECT * FROM sessions WHERE token_hash = ? AND is_active = 1 AND expires_at > NOW()",
      [tokenHash],
    )
    return sessions.length > 0 ? sessions[0] : null
  }

  static async getUserActiveSessions(userId: number): Promise<any[]> {
    return await this.query(
      `SELECT * FROM sessions 
       WHERE user_id = ? AND is_active = 1 AND expires_at > NOW() 
       ORDER BY last_used DESC`,
      [userId],
    )
  }

  static async revokeSession(sessionId: number, userId: number): Promise<boolean> {
    const result = await this.query("UPDATE sessions SET is_active = 0 WHERE id = ? AND user_id = ?", [
      sessionId,
      userId,
    ])
    return result.affectedRows > 0
  }

  static async revokeAllUserSessions(userId: number, exceptTokenHash?: string): Promise<number> {
    const query = exceptTokenHash
      ? "UPDATE sessions SET is_active = 0 WHERE user_id = ? AND token_hash != ?"
      : "UPDATE sessions SET is_active = 0 WHERE user_id = ?"

    const params = exceptTokenHash ? [userId, exceptTokenHash] : [userId]
    const result = await this.query(query, params)
    return result.affectedRows
  }

  static async getSessionStats(userId: number): Promise<{
    totalSessions: number
    activeSessions: number
    expiredSessions: number
  }> {
    const [totalResult, activeResult, expiredResult] = await Promise.all([
      this.query("SELECT COUNT(*) as count FROM sessions WHERE user_id = ?", [userId]),
      this.query("SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND is_active = 1 AND expires_at > NOW()", [
        userId,
      ]),
      this.query(
        "SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND (is_active = 0 OR expires_at <= NOW())",
        [userId],
      ),
    ])

    return {
      totalSessions: totalResult[0]?.count || 0,
      activeSessions: activeResult[0]?.count || 0,
      expiredSessions: expiredResult[0]?.count || 0,
    }
  }

  // Método para asignar rol por defecto (si existe sistema de roles)
  static async assignDefaultRole(userId: number): Promise<void> {
    try {
      // Verificar si existe la tabla de roles
      const tables = await this.query("SHOW TABLES LIKE 'user_roles'")
      if (tables.length > 0) {
        // Asignar rol 'user' por defecto si existe
        const roles = await this.query("SELECT id FROM roles WHERE name = 'user' LIMIT 1")
        if (roles.length > 0) {
          await this.query("INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at) VALUES (?, ?, NOW())", [
            userId,
            roles[0].id,
          ])
        }
      }
    } catch (error) {
      console.error("Error assigning default role:", error)
    }
  }
}
