import mysql from "mysql2/promise"

export interface User {
  id: number
  username: string
  email?: string
  wikimedia_id?: string
  avatar_url?: string
  registration_date?: string
  last_login?: string
  is_claimed: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  wikimedia_id?: string
  username: string
  email?: string
  avatar_url?: string
  registration_date?: string
  is_claimed?: boolean
}

export class Database {
  private static connection: mysql.Connection | null = null

  /**
   * Obtiene la conexión a la base de datos
   */
  private static async getConnection(): Promise<mysql.Connection> {
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

  /**
   * Ejecuta una consulta SQL
   */
  static async query(sql: string, params: any[] = []): Promise<any> {
    const connection = await this.getConnection()
    const [results] = await connection.execute(sql, params)
    return results
  }

  /**
   * Inicializa las tablas necesarias
   */
  static async initializeTables(): Promise<void> {
    try {
      // Actualizar tabla de sesiones para usar session IDs compactos
      await this.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id VARCHAR(22) PRIMARY KEY,
          user_id INT NOT NULL,
          token_hash VARCHAR(22) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip_address VARCHAR(45),
          user_agent TEXT,
          device_info VARCHAR(255),
          origin VARCHAR(255),
          INDEX idx_user_id (user_id),
          INDEX idx_expires_at (expires_at),
          INDEX idx_token_hash (token_hash)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `)

      // Limpiar sesiones con formato antiguo (si existen)
      await this.query("DELETE FROM sessions WHERE LENGTH(token_hash) > 22")

      console.log("✅ Database tables initialized")
    } catch (error) {
      console.error("❌ Error initializing tables:", error)
      throw error
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  static async getUserById(id: number): Promise<User | null> {
    try {
      const users = await this.query("SELECT * FROM users WHERE id = ?", [id])
      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error("❌ Error getting user by ID:", error)
      return null
    }
  }

  /**
   * Obtiene un usuario por nombre de usuario
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const users = await this.query("SELECT * FROM users WHERE username = ?", [username])
      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error("❌ Error getting user by username:", error)
      return null
    }
  }

  /**
   * Obtiene un usuario por Wikimedia ID
   */
  static async getUserByWikipediaId(wikimediaId: string): Promise<User | null> {
    try {
      const users = await this.query("SELECT * FROM users WHERE wikimedia_id = ?", [wikimediaId])
      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error("❌ Error getting user by Wikimedia ID:", error)
      return null
    }
  }

  /**
   * Crea un nuevo usuario
   */
  static async createUser(userData: CreateUserData): Promise<User | null> {
    try {
      const result = await this.query(
        `INSERT INTO users (
          wikimedia_id, username, email, avatar_url, 
          registration_date, is_claimed, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userData.wikimedia_id,
          userData.username,
          userData.email,
          userData.avatar_url,
          userData.registration_date,
          userData.is_claimed || false,
        ],
      )

      return await this.getUserById(result.insertId)
    } catch (error) {
      console.error("❌ Error creating user:", error)
      return null
    }
  }

  /**
   * Reclama una cuenta existente
   */
  static async claimUserAccount(userId: number, wikimediaId: string, email?: string): Promise<User | null> {
    try {
      await this.query(
        "UPDATE users SET wikimedia_id = ?, email = ?, is_claimed = 1, updated_at = NOW() WHERE id = ?",
        [wikimediaId, email, userId],
      )

      return await this.getUserById(userId)
    } catch (error) {
      console.error("❌ Error claiming user account:", error)
      return null
    }
  }

  /**
   * Actualiza el último login de un usuario
   */
  static async updateUserLogin(userId: number): Promise<void> {
    try {
      await this.query("UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = ?", [userId])
    } catch (error) {
      console.error("❌ Error updating user login:", error)
    }
  }

  /**
   * Asigna rol por defecto a un usuario
   */
  static async assignDefaultRole(userId: number): Promise<void> {
    try {
      // Verificar si existe tabla de roles
      const tables = await this.query("SHOW TABLES LIKE 'user_roles'")
      if (tables.length === 0) {
        console.log("ℹ️ No role system found, skipping default role assignment")
        return
      }

      // Asignar rol por defecto si existe
      await this.query(
        "INSERT IGNORE INTO user_roles (user_id, role_id) SELECT ?, id FROM roles WHERE name = 'user' LIMIT 1",
        [userId],
      )
    } catch (error) {
      console.error("❌ Error assigning default role:", error)
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  static async getUserStats(): Promise<{
    total: number
    claimed: number
    unclaimed: number
    recentLogins: number
  }> {
    try {
      const [totalResult, claimedResult, unclaimedResult, recentResult] = await Promise.all([
        this.query("SELECT COUNT(*) as count FROM users"),
        this.query("SELECT COUNT(*) as count FROM users WHERE is_claimed = 1"),
        this.query("SELECT COUNT(*) as count FROM users WHERE is_claimed = 0"),
        this.query("SELECT COUNT(*) as count FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)"),
      ])

      return {
        total: totalResult[0].count,
        claimed: claimedResult[0].count,
        unclaimed: unclaimedResult[0].count,
        recentLogins: recentResult[0].count,
      }
    } catch (error) {
      console.error("❌ Error getting user stats:", error)
      return { total: 0, claimed: 0, unclaimed: 0, recentLogins: 0 }
    }
  }
}
