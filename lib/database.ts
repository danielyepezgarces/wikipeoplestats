import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00",
})

export interface User {
  id: number
  wikimedia_id?: string
  username: string
  email?: string
  avatar_url?: string
  registration_date?: string
  last_login?: string
  last_token_refresh?: string
  is_claimed: boolean
  created_at: string
  updated_at: string
}

export interface RefreshToken {
  id: number
  user_id: number
  token_jti: string
  expires_at: string
  created_at: string
  user_agent?: string
  ip_address?: string
  is_revoked: boolean
}

export class Database {
  static async getUserByWikipediaId(wikimediaId: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE wikimedia_id = ? LIMIT 1", [wikimediaId])
      const users = rows as User[]
      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error("Error getting user by Wikipedia ID:", error)
      return null
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE username = ? LIMIT 1", [username])
      const users = rows as User[]
      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error("Error getting user by username:", error)
      return null
    }
  }

  static async getUserById(id: number): Promise<User | null> {
    try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE id = ? LIMIT 1", [id])
      const users = rows as User[]
      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error("Error getting user by ID:", error)
      return null
    }
  }

  static async createUser(userData: {
    wikimedia_id?: string
    username: string
    email?: string
    avatar_url?: string
    registration_date?: string
    is_claimed: boolean
  }): Promise<User | null> {
    try {
      const [result] = await pool.execute(
        `INSERT INTO users (wikimedia_id, username, email, avatar_url, registration_date, is_claimed, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userData.wikimedia_id || null,
          userData.username,
          userData.email || null,
          userData.avatar_url || null,
          userData.registration_date || null,
          userData.is_claimed,
        ],
      )

      const insertResult = result as mysql.ResultSetHeader
      return await this.getUserById(insertResult.insertId)
    } catch (error) {
      console.error("Error creating user:", error)
      return null
    }
  }

  static async claimUserAccount(userId: number, wikimediaId: string, email?: string): Promise<User | null> {
    try {
      await pool.execute(
        "UPDATE users SET wikimedia_id = ?, email = ?, is_claimed = TRUE, updated_at = NOW() WHERE id = ?",
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
      await pool.execute("UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = ?", [userId])
    } catch (error) {
      console.error("Error updating user login:", error)
    }
  }

  static async updateUserTokenRefresh(userId: number): Promise<void> {
    try {
      await pool.execute("UPDATE users SET last_token_refresh = NOW(), updated_at = NOW() WHERE id = ?", [userId])
    } catch (error) {
      console.error("Error updating user token refresh:", error)
    }
  }

  static async assignDefaultRole(userId: number): Promise<void> {
    try {
      // Asignar rol de usuario por defecto
      await pool.execute("INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)", [userId, "user"])
    } catch (error) {
      console.error("Error assigning default role:", error)
    }
  }

  static async storeRefreshToken(tokenData: {
    user_id: number
    token_jti: string
    expires_at: string
    user_agent?: string
    ip_address?: string
  }): Promise<void> {
    try {
      await pool.execute(
        `INSERT INTO refresh_tokens (user_id, token_jti, expires_at, user_agent, ip_address, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          tokenData.user_id,
          tokenData.token_jti,
          tokenData.expires_at,
          tokenData.user_agent || null,
          tokenData.ip_address || null,
        ],
      )
    } catch (error) {
      console.error("Error storing refresh token:", error)
    }
  }

  static async getRefreshToken(tokenJti: string): Promise<RefreshToken | null> {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM refresh_tokens WHERE token_jti = ? AND is_revoked = FALSE AND expires_at > NOW() LIMIT 1",
        [tokenJti],
      )
      const tokens = rows as RefreshToken[]
      return tokens.length > 0 ? tokens[0] : null
    } catch (error) {
      console.error("Error getting refresh token:", error)
      return null
    }
  }

  static async revokeRefreshToken(tokenJti: string): Promise<void> {
    try {
      await pool.execute("UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_jti = ?", [tokenJti])
    } catch (error) {
      console.error("Error revoking refresh token:", error)
    }
  }

  static async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    try {
      await pool.execute("UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?", [userId])
    } catch (error) {
      console.error("Error revoking all user refresh tokens:", error)
    }
  }

  static async addTokenToBlacklist(tokenJti: string, expiresAt: string): Promise<void> {
    try {
      await pool.execute("INSERT INTO token_blacklist (token_jti, expires_at, created_at) VALUES (?, ?, NOW())", [
        tokenJti,
        expiresAt,
      ])
    } catch (error) {
      console.error("Error adding token to blacklist:", error)
    }
  }

  static async isTokenBlacklisted(tokenJti: string): Promise<boolean> {
    try {
      const [rows] = await pool.execute(
        "SELECT 1 FROM token_blacklist WHERE token_jti = ? AND expires_at > NOW() LIMIT 1",
        [tokenJti],
      )
      const results = rows as any[]
      return results.length > 0
    } catch (error) {
      console.error("Error checking token blacklist:", error)
      return false
    }
  }

  static async cleanupExpiredTokens(): Promise<void> {
    try {
      // Limpiar refresh tokens expirados
      await pool.execute("DELETE FROM refresh_tokens WHERE expires_at < NOW()")

      // Limpiar tokens blacklisteados expirados
      await pool.execute("DELETE FROM token_blacklist WHERE expires_at < NOW()")

      console.log("✅ Expired tokens cleaned up")
    } catch (error) {
      console.error("Error cleaning up expired tokens:", error)
    }
  }
}
