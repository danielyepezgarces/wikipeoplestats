import mysql from "mysql2/promise"

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

export interface TokenBlacklist {
  id: number
  token_jti: string
  user_id: number
  revoked_at: string
  expires_at: string
  reason: string
  token_type: "access" | "refresh"
}

export interface RefreshToken {
  id: number
  user_id: number
  token_jti: string
  expires_at: string
  is_active: boolean
  created_at: string
  last_used: string
  user_agent?: string
  ip_address?: string
}

export class Database {
  static async getConnection(): Promise<mysql.PoolConnection> {
    return await pool.getConnection()
  }

  static async initializeTables(): Promise<void> {
    const conn = await this.getConnection()
    try {
      // Actualizar tabla de usuarios
      await conn.execute(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NULL,
        MODIFY COLUMN wikimedia_id VARCHAR(255) NULL
      `)

      // Crear tabla de refresh tokens
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token_jti VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          user_agent TEXT NULL,
          ip_address VARCHAR(45) NULL,
          INDEX idx_user_id (user_id),
          INDEX idx_token_jti (token_jti),
          INDEX idx_expires_active (expires_at, is_active),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)

      // Actualizar tabla de blacklist de tokens para usar JTI
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS token_blacklist (
          id INT AUTO_INCREMENT PRIMARY KEY,
          token_jti VARCHAR(255) NOT NULL,
          user_id INT NOT NULL,
          revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          reason VARCHAR(255) DEFAULT 'manual_revocation',
          token_type ENUM('access', 'refresh') DEFAULT 'access',
          INDEX idx_token_jti (token_jti),
          INDEX idx_user_id (user_id),
          INDEX idx_expires_at (expires_at),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)

      // Eliminar tabla de sesiones antigua si existe
      await conn.execute(`DROP TABLE IF EXISTS sessions`)
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

  // Refresh Token Methods
  static async storeRefreshToken(data: {
    user_id: number
    token_jti: string
    expires_at: string
    user_agent?: string
    ip_address?: string
  }): Promise<RefreshToken> {
    const conn = await this.getConnection()
    try {
      const userAgent = data.user_agent || null
      const ipAddress = data.ip_address || null

      const [result] = await conn.execute(
        `INSERT INTO refresh_tokens (user_id, token_jti, expires_at, user_agent, ip_address, is_active, created_at, last_used)
         VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
        [data.user_id, data.token_jti, data.expires_at, userAgent, ipAddress],
      )
      const insertResult = result as mysql.ResultSetHeader
      const refreshToken = await this.getRefreshTokenById(insertResult.insertId)
      if (!refreshToken) {
        throw new Error("Refresh token creation failed")
      }
      return refreshToken
    } finally {
      conn.release()
    }
  }

  static async getRefreshTokenById(id: number): Promise<RefreshToken | null> {
    const conn = await this.getConnection()
    try {
      const [rows] = await conn.execute("SELECT * FROM refresh_tokens WHERE id = ?", [id])
      const tokens = rows as RefreshToken[]
      return tokens[0] || null
    } finally {
      conn.release()
    }
  }

  static async getRefreshTokenByJti(jti: string): Promise<RefreshToken | null> {
    const conn = await this.getConnection()
    try {
      const [rows] = await conn.execute(
        "SELECT * FROM refresh_tokens WHERE token_jti = ? AND is_active = TRUE AND expires_at > NOW()",
        [jti],
      )
      const tokens = rows as RefreshToken[]
      return tokens[0] || null
    } finally {
      conn.release()
    }
  }

  static async updateRefreshTokenLastUsed(jti: string): Promise<void> {
    const conn = await this.getConnection()
    try {
      await conn.execute("UPDATE refresh_tokens SET last_used = NOW() WHERE token_jti = ?", [jti])
    } finally {
      conn.release()
    }
  }

  static async revokeRefreshToken(jti: string, userId?: number): Promise<boolean> {
    const conn = await this.getConnection()
    try {
      let query = "UPDATE refresh_tokens SET is_active = FALSE WHERE token_jti = ?"
      const params: any[] = [jti]

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

  static async revokeAllUserRefreshTokens(userId: number): Promise<number> {
    const conn = await this.getConnection()
    try {
      const [result] = await conn.execute("UPDATE refresh_tokens SET is_active = FALSE WHERE user_id = ?", [userId])
      const updateResult = result as mysql.ResultSetHeader
      return updateResult.affectedRows
    } finally {
      conn.release()
    }
  }

  static async getUserActiveRefreshTokens(userId: number): Promise<RefreshToken[]> {
    const conn = await this.getConnection()
    try {
      const [rows] = await conn.execute(
        `SELECT * FROM refresh_tokens 
         WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()
         ORDER BY last_used DESC`,
        [userId],
      )
      return rows as RefreshToken[]
    } finally {
      conn.release()
    }
  }

  static async cleanupExpiredRefreshTokens(): Promise<void> {
    const conn = await this.getConnection()
    try {
      await conn.execute("DELETE FROM refresh_tokens WHERE expires_at < NOW()")
    } finally {
      conn.release()
    }
  }

  // Token Blacklist Methods (updated for JTI)
  static async blacklistToken(
    tokenJti: string,
    userId: number,
    tokenType: "access" | "refresh" = "access",
    reason = "manual_revocation",
  ): Promise<void> {
    const conn = await this.getConnection()
    try {
      // Calcular la fecha de expiración basada en el tipo de token
      const expiry =
        tokenType === "access"
          ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas para access tokens
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días para refresh tokens

      await conn.execute(
        `INSERT INTO token_blacklist (token_jti, user_id, expires_at, reason, token_type)
         VALUES (?, ?, ?, ?, ?)`,
        [tokenJti, userId, expiry, reason, tokenType],
      )
    } finally {
      conn.release()
    }
  }

  static async isTokenBlacklisted(tokenJti: string): Promise<boolean> {
    const conn = await this.getConnection()
    try {
      const [rows] = await conn.execute("SELECT id FROM token_blacklist WHERE token_jti = ? AND expires_at > NOW()", [
        tokenJti,
      ])
      const results = rows as any[]
      return results.length > 0
    } finally {
      conn.release()
    }
  }

  static async cleanupExpiredBlacklistedTokens(): Promise<void> {
    const conn = await this.getConnection()
    try {
      await conn.execute("DELETE FROM token_blacklist WHERE expires_at < NOW()")
    } finally {
      conn.release()
    }
  }

  static async getBlacklistedTokens(userId?: number): Promise<TokenBlacklist[]> {
    const conn = await this.getConnection()
    try {
      let query = "SELECT * FROM token_blacklist WHERE expires_at > NOW()"
      const params: any[] = []

      if (userId) {
        query += " AND user_id = ?"
        params.push(userId)
      }

      query += " ORDER BY revoked_at DESC"

      const [rows] = await conn.execute(query, params)
      return rows as TokenBlacklist[]
    } finally {
      conn.release()
    }
  }
}

// Export the getConnection function for backward compatibility
export async function getConnection(): Promise<mysql.PoolConnection> {
  return await Database.getConnection()
}
