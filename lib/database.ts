import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wikipeoplestats',
  timezone: '+00:00',
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 25,
  queueLimit: 0,
})

export async function getConnection(): Promise<mysql.PoolConnection> {
  return await pool.getConnection()
}

export interface User {
  id: number
  wikimedia_id: string
  username: string
  email?: string
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
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
  created_at: string
  last_used: string
}

export class Database {
  static async getUserByWikipediaId(wikimediaId: string): Promise<User | null> {
    const conn = await getConnection()
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM users WHERE wikimedia_id = ? AND is_active = 1',
        [wikimediaId]
      )
      const users = rows as User[]
      return users[0] || null
    } finally {
      conn.release()
    }
  }

  static async createUser(data: {
    wikimedia_id: string
    username: string
    email?: string
  }): Promise<User> {
    const conn = await getConnection()
    try {
      const [result] = await conn.execute(
        `INSERT INTO users (wikimedia_id, username, email, created_at, updated_at, is_active)
         VALUES (?, ?, ?, NOW(), NOW(), 1)`,
        [data.wikimedia_id, data.username, data.email]
      )
      const insertResult = result as mysql.ResultSetHeader
      const user = await this.getUserById(insertResult.insertId)
      if (!user) {
        throw new Error('User creation failed')
      }
      return user
    } finally {
      conn.release()
    }
  }

  static async getUserById(id: number): Promise<User | null> {
    const conn = await getConnection()
    try {
      const [rows] = await conn.execute('SELECT * FROM users WHERE id = ?', [id])
      const users = rows as User[]
      return users[0] || null
    } finally {
      conn.release()
    }
  }

  static async updateUserLogin(userId: number): Promise<void> {
    const conn = await getConnection()
    try {
      await conn.execute(
        'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = ?',
        [userId]
      )
    } finally {
      conn.release()
    }
  }

  static async assignDefaultRole(userId: number, roleId: number = 1): Promise<void> {
    const conn = await getConnection()
    try {
      await conn.execute(
        `INSERT INTO user_roles (user_id, role_id, created_at)
         VALUES (?, ?, NOW())`,
        [userId, roleId]
      )
    } finally {
      conn.release()
    }
  }

  static async createSession(data: Partial<Session>): Promise<Session> {
    const conn = await getConnection()
    try {
      const [result] = await conn.execute(
        `INSERT INTO sessions (user_id, token_hash, expires_at, origin_domain, user_agent, ip_address, created_at, last_used)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          data.user_id,
          data.token_hash,
          data.expires_at,
          data.origin_domain,
          data.user_agent,
          data.ip_address
        ]
      )
      const insertResult = result as mysql.ResultSetHeader
      const session = await this.getSessionById(insertResult.insertId)
      if (!session) {
        throw new Error('Session creation failed')
      }
      return session
    } finally {
      conn.release()
    }
  }

  static async getSessionById(id: number): Promise<Session | null> {
    const conn = await getConnection()
    try {
      const [rows] = await conn.execute('SELECT * FROM sessions WHERE id = ?', [id])
      const sessions = rows as Session[]
      return sessions[0] || null
    } finally {
      conn.release()
    }
  }

  static async deleteExpiredSessions(): Promise<void> {
    const conn = await getConnection()
    try {
      await conn.execute('DELETE FROM sessions WHERE expires_at < NOW()')
    } finally {
      conn.release()
    }
  }
}
