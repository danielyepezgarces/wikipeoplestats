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

let connection: mysql.Connection | null = null

export class Database {
  static async getConnection(): Promise<mysql.Connection> {
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "wikipeoplestats",
        charset: "utf8mb4",
      })
    }
    return connection
  }

  static async query(sql: string, params: any[] = []): Promise<any> {
    const conn = await this.getConnection()
    const [results] = await conn.execute(sql, params)
    return results
  }

  static async initializeTables(): Promise<void> {
    const conn = await this.getConnection()

    // Crear tabla de usuarios si no existe
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wikimedia_id VARCHAR(255) UNIQUE,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        avatar_url TEXT,
        registration_date DATETIME,
        is_claimed BOOLEAN DEFAULT FALSE,
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_wikimedia_id (wikimedia_id),
        INDEX idx_username (username)
      )
    `)

    // Crear tabla de sesiones
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(22) PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(22) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_info VARCHAR(255),
        origin VARCHAR(255),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token_hash (token_hash),
        INDEX idx_expires_at (expires_at)
      )
    `)

    // Crear tabla de roles si no existe
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de user_roles si no existe
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_role (user_id, role_id)
      )
    `)

    // Insertar roles por defecto
    await conn.execute(`
      INSERT IGNORE INTO roles (name, description) VALUES 
      ('user', 'Default user role'),
      ('moderator', 'Moderator role'),
      ('admin', 'Administrator role'),
      ('super_admin', 'Super administrator role')
    `)

    console.log("✅ Database tables initialized")
  }

  static async getUserByWikipediaId(wikipediaId: string): Promise<any> {
    const results = await this.query("SELECT * FROM users WHERE wikimedia_id = ?", [wikipediaId])
    return results[0] || null
  }

  static async getUserByUsername(username: string): Promise<any> {
    const results = await this.query("SELECT * FROM users WHERE username = ?", [username])
    return results[0] || null
  }

  static async getUserById(id: number): Promise<any> {
    const results = await this.query("SELECT * FROM users WHERE id = ?", [id])
    return results[0] || null
  }

  static async createUser(userData: {
    wikimedia_id: string
    username: string
    email?: string
    avatar_url?: string
    registration_date?: string
    is_claimed?: boolean
  }): Promise<any> {
    const result = await this.query(
      `
      INSERT INTO users (wikimedia_id, username, email, avatar_url, registration_date, is_claimed)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        userData.wikimedia_id,
        userData.username,
        userData.email || null,
        userData.avatar_url || null,
        userData.registration_date || null,
        userData.is_claimed || false,
      ],
    )

    return await this.getUserById(result.insertId)
  }

  static async claimUserAccount(userId: number, wikipediaId: string, email?: string): Promise<any> {
    await this.query(
      `
      UPDATE users 
      SET wikimedia_id = ?, email = ?, is_claimed = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [wikipediaId, email || null, userId],
    )

    return await this.getUserById(userId)
  }

  static async updateUserLogin(userId: number): Promise<void> {
    await this.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [userId])
  }

  static async assignDefaultRole(userId: number): Promise<void> {
    const roleResult = await this.query("SELECT id FROM roles WHERE name = ?", ["user"])

    if (roleResult.length > 0) {
      await this.query(
        `
        INSERT IGNORE INTO user_roles (user_id, role_id)
        VALUES (?, ?)
      `,
        [userId, roleResult[0].id],
      )
    }
  }

  static async getUserRoles(userId: number): Promise<string[]> {
    const results = await this.query(
      `
      SELECT r.name 
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `,
      [userId],
    )

    return results.map((row: any) => row.name)
  }

  static async createSession(sessionData: {
    user_id: number
    token_hash: string
    expires_at: string
    origin_domain?: string
    user_agent?: string
    ip_address?: string
    device_info?: string
  }): Promise<void> {
    await this.query(
      `
      INSERT INTO sessions (id, user_id, token_hash, expires_at, ip_address, user_agent, device_info, origin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        sessionData.token_hash, // usar token_hash como id también
        sessionData.user_id,
        sessionData.token_hash,
        sessionData.expires_at,
        sessionData.ip_address || null,
        sessionData.user_agent || null,
        sessionData.device_info || null,
        sessionData.origin_domain || null,
      ],
    )
  }
}

// Exportar función getConnection para compatibilidad
export async function getConnection(): Promise<mysql.Connection> {
  return Database.getConnection()
}
