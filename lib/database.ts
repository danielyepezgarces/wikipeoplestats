import mysql from "mysql2/promise"

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "wikipeoplestats",
  charset: "utf8mb4",
  timezone: "+00:00",
}

let pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

export async function getConnection(): Promise<mysql.PoolConnection> {
  return await getPool().getConnection()
}

export interface User {
  id: number
  wikimedia_id: string | null
  username: string
  email: string | null
  avatar_url: string | null
  registration_date: string | null
  created_at: string
  updated_at: string
  last_login: string | null
  is_claimed: boolean
  last_token_refresh: string | null
  token_version: number
}

export interface RefreshToken {
  id: number
  user_id: number
  token_jti: string
  expires_at: string
  created_at: string
  user_agent: string | null
  ip_address: string | null
  is_revoked: boolean
}

export class Database {
  static async initializeTables(): Promise<void> {
    const connection = await getPool().getConnection()

    try {
      // Crear tabla users si no existe
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          wikimedia_id VARCHAR(255) UNIQUE,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          avatar_url TEXT,
          registration_date DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          last_login TIMESTAMP NULL,
          is_claimed BOOLEAN DEFAULT FALSE,
          last_token_refresh TIMESTAMP NULL,
          token_version INT DEFAULT 1,
          INDEX idx_wikimedia_id (wikimedia_id),
          INDEX idx_username (username),
          INDEX idx_is_claimed (is_claimed)
        )
      `)

      // Crear tabla refresh_tokens si no existe
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token_jti VARCHAR(255) NOT NULL UNIQUE,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          user_agent TEXT,
          ip_address VARCHAR(45),
          is_revoked BOOLEAN DEFAULT FALSE,
          INDEX idx_user_id (user_id),
          INDEX idx_token_jti (token_jti),
          INDEX idx_expires_at (expires_at),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)

      // Crear tabla token_blacklist si no existe
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS token_blacklist (
          id INT AUTO_INCREMENT PRIMARY KEY,
          token_jti VARCHAR(255) NOT NULL,
          user_id INT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          reason VARCHAR(255),
          token_type ENUM('access', 'refresh') DEFAULT 'access',
          INDEX idx_token_jti (token_jti),
          INDEX idx_expires_at (expires_at),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)

      console.log("✅ Database tables initialized")
    } finally {
      connection.release()
    }
  }

  static async getUserByWikipediaId(wikimediaId: string): Promise<User | null> {
    const connection = await getPool().getConnection()

    try {
      const [rows] = await connection.execute("SELECT * FROM users WHERE wikimedia_id = ?", [wikimediaId])

      const users = rows as User[]
      return users.length > 0 ? users[0] : null
    } finally {
      connection.release()
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const connection = await getPool().getConnection()

    try {
      const [rows] = await connection.execute("SELECT * FROM users WHERE username = ?", [username])

      const users = rows as User[]
      return users.length > 0 ? users[0] : null
    } finally {
      connection.release()
    }
  }

  static async createUser(userData: {
    wikimedia_id?: string
    username: string
    email?: string
    avatar_url?: string
    registration_date?: string
    is_claimed?: boolean
  }): Promise<User | null> {
    const connection = await getPool().getConnection()

    try {
      const [result] = await connection.execute(
        `INSERT INTO users (wikimedia_id, username, email, avatar_url, registration_date, is_claimed)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userData.wikimedia_id || null,
          userData.username,
          userData.email || null,
          userData.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              userData.username,
            )}&background=random&color=fff&rounded=true&size=150`,
          userData.registration_date || null,
          userData.is_claimed || false,
        ],
      )

      const insertResult = result as mysql.ResultSetHeader
      return await this.getUserById(insertResult.insertId)
    } finally {
      connection.release()
    }
  }

  static async getUserById(id: number): Promise<User | null> {
    const connection = await getPool().getConnection()

    try {
      const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [id])

      const users = rows as User[]
      return users.length > 0 ? users[0] : null
    } finally {
      connection.release()
    }
  }

  static async claimUserAccount(userId: number, wikimediaId: string, email?: string): Promise<User | null> {
    const connection = await getPool().getConnection()

    try {
      await connection.execute("UPDATE users SET wikimedia_id = ?, email = ?, is_claimed = TRUE WHERE id = ?", [
        wikimediaId,
        email || null,
        userId,
      ])

      return await this.getUserById(userId)
    } finally {
      connection.release()
    }
  }

  static async updateUserLogin(userId: number): Promise<void> {
    const connection = await getPool().getConnection()

    try {
      await connection.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [userId])
    } finally {
      connection.release()
    }
  }

  static async assignDefaultRole(userId: number): Promise<void> {
    // Implementar asignación de rol por defecto si es necesario
    console.log(`Default role assigned to user ${userId}`)
  }

  static async storeRefreshToken(tokenData: {
    user_id: number
    token_jti: string
    expires_at: string
    user_agent?: string
    ip_address?: string
  }): Promise<void> {
    const connection = await getPool().getConnection()

    try {
      // Convertir timestamp de string a Date para MySQL
      const expiresAtDate = new Date(parseInt(tokenData.expires_at) * 1000)
      
      await connection.execute(
        `INSERT INTO refresh_tokens (user_id, token_jti, expires_at, user_agent, ip_address)
         VALUES (?, ?, ?, ?, ?)`,
        [
          tokenData.user_id,
          tokenData.token_jti,
          expiresAtDate, // Date object
          tokenData.user_agent || null,
          tokenData.ip_address || null,
        ],
      )
      
      console.log("✅ Refresh token stored in database:", {
        user_id: tokenData.user_id,
        token_jti: tokenData.token_jti.substring(0, 8) + "...",
        expires_at: expiresAtDate.toISOString()
      })
    } finally {
      connection.release()
    }
  }

  static async getRefreshToken(tokenJti: string): Promise<RefreshToken | null> {
    const connection = await getPool().getConnection()

    try {
      const [rows] = await connection.execute(
        "SELECT * FROM refresh_tokens WHERE token_jti = ? AND is_revoked = FALSE AND expires_at > NOW()",
        [tokenJti],
      )

      const tokens = rows as RefreshToken[]
      return tokens.length > 0 ? tokens[0] : null
    } finally {
      connection.release()
    }
  }

  static async revokeRefreshToken(tokenJti: string): Promise<void> {
    const connection = await getPool().getConnection()

    try {
      await connection.execute("UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_jti = ?", [tokenJti])
    } finally {
      connection.release()
    }
  }

  static async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    const connection = await getPool().getConnection()

    try {
      await connection.execute("UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?", [userId])
    } finally {
      connection.release()
    }
  }

  static async blacklistToken(tokenJti: string, userId: number, reason?: string): Promise<void> {
    const connection = await getPool().getConnection()

    try {
      await connection.execute(
        `INSERT INTO token_blacklist (token_jti, user_id, expires_at, reason)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY), ?)`,
        [tokenJti, userId, reason || "Manual revocation"],
      )
    } finally {
      connection.release()
    }
  }

  static async isTokenBlacklisted(tokenJti: string): Promise<boolean> {
    const connection = await getPool().getConnection()

    try {
      const [rows] = await connection.execute(
        "SELECT 1 FROM token_blacklist WHERE token_jti = ? AND expires_at > NOW()",
        [tokenJti],
      )

      return (rows as any[]).length > 0
    } finally {
      connection.release()
    }
  }

  static async cleanupExpiredTokens(): Promise<void> {
    const connection = await getPool().getConnection()

    try {
      // Limpiar refresh tokens expirados
      await connection.execute("DELETE FROM refresh_tokens WHERE expires_at < NOW()")

      // Limpiar tokens blacklisteados expirados
      await connection.execute("DELETE FROM token_blacklist WHERE expires_at < NOW()")

      console.log("✅ Expired tokens cleaned up")
    } finally {
      connection.release()
    }
  }
}
