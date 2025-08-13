import { Database } from "./database"

export interface SessionData {
  id: number
  user_id: number
  token: string
  expires_at: string
  origin_domain: string
  user_agent?: string
  ip_address?: string
  device_info?: string
  is_active: boolean
  created_at: string
  last_used: string
}

export interface UserSession {
  id: number
  username: string
  email?: string
  avatar_url?: string
  is_claimed: boolean
  session_id: number
}

export class SessionManager {
  // Generate a secure random token
  static generateToken(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Create a new session
  static async createSession(data: {
    user_id: number
    origin_domain: string
    user_agent?: string
    ip_address?: string
    device_info?: string
  }): Promise<{ token: string; session: SessionData }> {
    const token = this.generateToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const session = await Database.createSession({
      user_id: data.user_id,
      token_hash: token, // Store the token directly (we'll hash it in DB if needed)
      expires_at: expiresAt.toISOString().slice(0, 19).replace("T", " "),
      origin_domain: data.origin_domain,
      user_agent: data.user_agent,
      ip_address: data.ip_address,
      device_info: data.device_info,
    })

    return { token, session }
  }

  // Validate a session token
  static async validateSession(token: string): Promise<UserSession | null> {
    if (!token) {
      return null
    }

    try {
      // Get session from database
      const session = await Database.getSessionByToken(token)
      if (!session || !session.is_active) {
        return null
      }

      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        await Database.revokeSession(session.id)
        return null
      }

      // Get user data
      const user = await Database.getUserById(session.user_id)
      if (!user || !user.is_active) {
        await Database.revokeSession(session.id)
        return null
      }

      // Update last used time
      await Database.updateSessionLastUsed(session.id)

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        is_claimed: user.is_claimed,
        session_id: session.id,
      }
    } catch (error) {
      console.error("Session validation error:", error)
      return null
    }
  }

  // Revoke a session
  static async revokeSession(token: string): Promise<boolean> {
    try {
      const session = await Database.getSessionByToken(token)
      if (!session) {
        return false
      }

      return await Database.revokeSession(session.id)
    } catch (error) {
      console.error("Session revocation error:", error)
      return false
    }
  }

  // Revoke all user sessions except current
  static async revokeAllUserSessions(userId: number, exceptToken?: string): Promise<number> {
    try {
      let exceptSessionId: number | undefined

      if (exceptToken) {
        const currentSession = await Database.getSessionByToken(exceptToken)
        exceptSessionId = currentSession?.id
      }

      return await Database.revokeAllUserSessions(userId, exceptSessionId)
    } catch (error) {
      console.error("Error revoking user sessions:", error)
      return 0
    }
  }

  // Get user active sessions
  static async getUserSessions(userId: number): Promise<SessionData[]> {
    try {
      return await Database.getUserActiveSessions(userId)
    } catch (error) {
      console.error("Error getting user sessions:", error)
      return []
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await Database.deleteExpiredSessions()
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error)
    }
  }

  // Get session info
  static async getSessionInfo(token: string): Promise<SessionData | null> {
    try {
      return await Database.getSessionByToken(token)
    } catch (error) {
      console.error("Error getting session info:", error)
      return null
    }
  }

  // Extend session expiration
  static async extendSession(token: string, days = 30): Promise<boolean> {
    try {
      const session = await Database.getSessionByToken(token)
      if (!session || !session.is_active) {
        return false
      }

      const newExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      return await Database.extendSession(session.id, newExpiresAt.toISOString().slice(0, 19).replace("T", " "))
    } catch (error) {
      console.error("Error extending session:", error)
      return false
    }
  }
}
