// lib/database.ts
import mysql from 'mysql2/promise'

let connection: mysql.Connection | null = null

export async function getConnection(): Promise<mysql.Connection> {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wikipeoplestats',
      timezone: '+00:00',
      dateStrings: true
    })
  }
  return connection
}

export interface User {
  id: string
  name: string
  email?: string
  wikipedia_id: string
  wikipedia_username: string
  wikimedia_role: 'super_admin' | 'community_admin' | 'community_moderator' | 'community_partner'
  chapter_assigned?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Session {
  id: string
  user_id: string
  token_hash: string
  expires_at: string
  origin_domain: string
  user_agent?: string
  ip_address?: string
  created_at: string
  last_used: string
}

export class Database {
  static async createUser(userData: Partial<User>): Promise<User> {
    const conn = await getConnection()
    const [result] = await conn.execute(
      `INSERT INTO users (name, email, wikipedia_id, wikipedia_username, wikimedia_role, chapter_assigned, avatar_url, last_login) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userData.name,
        userData.email,
        userData.wikipedia_id,
        userData.wikipedia_username,
        userData.wikimedia_role || 'community_partner',
        userData.chapter_assigned,
        userData.avatar_url
      ]
    )
    
    const insertResult = result as mysql.ResultSetHeader
    return this.getUserById(insertResult.insertId.toString())
  }
  
  static async getUserById(id: string): Promise<User | null> {
    const conn = await getConnection()
    const [rows] = await conn.execute(
      'SELECT * FROM users WHERE id = ? AND is_active = 1',
      [id]
    )
    
    const users = rows as User[]
    return users[0] || null
  }
  
  static async getUserByWikipediaId(wikipediaId: string): Promise<User | null> {
    const conn = await getConnection()
    const [rows] = await conn.execute(
      'SELECT * FROM users WHERE wikipedia_id = ? AND is_active = 1',
      [wikipediaId]
    )
    
    const users = rows as User[]
    return users[0] || null
  }
  
  static async updateUserLogin(userId: string): Promise<void> {
    const conn = await getConnection()
    await conn.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [userId]
    )
  }
  
  static async createSession(sessionData: Partial<Session>): Promise<Session> {
    const conn = await getConnection()
    const [result] = await conn.execute(
      `INSERT INTO sessions (user_id, token_hash, expires_at, origin_domain, user_agent, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        sessionData.user_id,
        sessionData.token_hash,
        sessionData.expires_at,
        sessionData.origin_domain,
        sessionData.user_agent,
        sessionData.ip_address
      ]
    )
    
    const insertResult = result as mysql.ResultSetHeader
    return this.getSessionById(insertResult.insertId.toString())
  }
  
  static async getSessionById(id: string): Promise<Session | null> {
    const conn = await getConnection()
    const [rows] = await conn.execute(
      'SELECT * FROM sessions WHERE id = ?',
      [id]
    )
    
    const sessions = rows as Session[]
    return sessions[0] || null
  }
  
  static async getSessionByToken(tokenHash: string): Promise<Session | null> {
    const conn = await getConnection()
    const [rows] = await conn.execute(
      'SELECT * FROM sessions WHERE token_hash = ? AND expires_at > NOW()',
      [tokenHash]
    )
    
    const sessions = rows as Session[]
    return sessions[0] || null
  }
  
  static async updateSessionUsage(sessionId: string): Promise<void> {
    const conn = await getConnection()
    await conn.execute(
      'UPDATE sessions SET last_used = NOW() WHERE id = ?',
      [sessionId]
    )
  }
  
  static async deleteSession(sessionId: string): Promise<void> {
    const conn = await getConnection()
    await conn.execute(
      'DELETE FROM sessions WHERE id = ?',
      [sessionId]
    )
  }
  
  static async deleteExpiredSessions(): Promise<void> {
    const conn = await getConnection()
    await conn.execute(
      'DELETE FROM sessions WHERE expires_at < NOW()'
    )
  }
  
  static async storeOAuthToken(token: string, tokenSecret: string, originDomain: string): Promise<void> {
    const conn = await getConnection()
    await conn.execute(
      'INSERT INTO oauth_tokens (request_token, request_token_secret, origin_domain, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
      [token, tokenSecret, originDomain]
    )
  }
  
  static async getOAuthToken(token: string): Promise<{ request_token_secret: string; origin_domain: string } | null> {
    const conn = await getConnection()
    const [rows] = await conn.execute(
      'SELECT request_token_secret, origin_domain FROM oauth_tokens WHERE request_token = ? AND expires_at > NOW()',
      [token]
    )
    
    const tokens = rows as any[]
    return tokens[0] || null
  }
  
  static async deleteOAuthToken(token: string): Promise<void> {
    const conn = await getConnection()
    await conn.execute(
      'DELETE FROM oauth_tokens WHERE request_token = ?',
      [token]
    )
  }
  
  static async getChapterBySubdomain(subdomain: string) {
    const conn = await getConnection()
    const [rows] = await conn.execute(
      'SELECT * FROM chapters WHERE subdomain = ? AND is_active = 1',
      [subdomain]
    )
    
    const chapters = rows as any[]
    return chapters[0] || null
  }
}