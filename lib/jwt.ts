import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

export interface JWTPayload {
  userId: number
  username: string
  email?: string
  sessionId?: number
  iat?: number
  exp?: number
}

export class JWTManager {
  static generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "wikipeoplestats",
      audience: "wikipeoplestats-users",
    })
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: "wikipeoplestats",
        audience: "wikipeoplestats-users",
      }) as JWTPayload
      return decoded
    } catch (error) {
      console.error("JWT verification failed:", error)
      return null
    }
  }

  static hashToken(token: string): string {
    // Use a simple hash for Edge Runtime compatibility
    let hash = 0
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
  }

  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000)
      }
      return null
    } catch (error) {
      return null
    }
  }

  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token)
    if (!expiration) return true
    return expiration < new Date()
  }
}

// Export individual functions for backward compatibility
export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return JWTManager.generateToken(payload)
}

export function verifyToken(token: string): JWTPayload | null {
  return JWTManager.verifyToken(token)
}

export function hashToken(token: string): string {
  return JWTManager.hashToken(token)
}

export function getTokenExpiration(token: string): Date | null {
  return JWTManager.getTokenExpiration(token)
}

export function isTokenExpired(token: string): boolean {
  return JWTManager.isTokenExpired(token)
}
