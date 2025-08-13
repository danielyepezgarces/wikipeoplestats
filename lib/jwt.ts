import jwt from "jsonwebtoken"
import crypto from "crypto"

export interface JWTPayload {
  userId: number
  username: string
  sessionId: number
  iat?: number
  exp?: number
}

export class JWTManager {
  private static readonly SECRET = process.env.JWT_SECRET || "your-secret-key"
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

  static generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    return jwt.sign(payload, this.SECRET, {
      expiresIn: this.EXPIRES_IN,
      issuer: "wikipeoplestats",
      audience: "wikipeoplestats-users",
    })
  }

  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.SECRET, {
        issuer: "wikipeoplestats",
        audience: "wikipeoplestats-users",
      }) as JWTPayload

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired")
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token")
      } else {
        throw new Error("Token verification failed")
      }
    }
  }

  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }

  static getTokenExpiration(): Date {
    const expiresIn = this.EXPIRES_IN
    const now = new Date()

    // Parse the expires in string (e.g., '7d', '24h', '60m')
    if (expiresIn.endsWith("d")) {
      const days = Number.parseInt(expiresIn.slice(0, -1))
      return new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    } else if (expiresIn.endsWith("h")) {
      const hours = Number.parseInt(expiresIn.slice(0, -1))
      return new Date(now.getTime() + hours * 60 * 60 * 1000)
    } else if (expiresIn.endsWith("m")) {
      const minutes = Number.parseInt(expiresIn.slice(0, -1))
      return new Date(now.getTime() + minutes * 60 * 1000)
    } else {
      // Default to 7 days if format is not recognized
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload
      if (!decoded || !decoded.exp) return true

      return Date.now() >= decoded.exp * 1000
    } catch {
      return true
    }
  }

  static getTokenPayload(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload
    } catch {
      return null
    }
  }
}
