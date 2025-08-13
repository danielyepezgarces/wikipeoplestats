import { Database } from "./database"

export interface SecurityEvent {
  userId?: number
  action: string
  details?: any
  ipAddress?: string
  userAgent?: string
}

export class SecurityLogger {
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const conn = await Database.getConnection()
    try {
      await conn.execute(
        `INSERT INTO security_logs (user_id, action, details, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          event.userId || null,
          event.action,
          event.details ? JSON.stringify(event.details) : null,
          event.ipAddress || null,
          event.userAgent || null,
        ],
      )
    } catch (error) {
      console.error("Failed to log security event:", error)
      // Don't throw error to avoid breaking the main flow
    } finally {
      conn.release()
    }
  }

  static async getSecurityLogs(userId?: number, limit = 100): Promise<any[]> {
    const conn = await Database.getConnection()
    try {
      let query = `
        SELECT sl.*, u.username 
        FROM security_logs sl
        LEFT JOIN users u ON sl.user_id = u.id
      `
      const params: any[] = []

      if (userId) {
        query += " WHERE sl.user_id = ?"
        params.push(userId)
      }

      query += " ORDER BY sl.created_at DESC LIMIT ?"
      params.push(limit)

      const [rows] = await conn.execute(query, params)
      return rows as any[]
    } finally {
      conn.release()
    }
  }
}
