import jwt from "jsonwebtoken"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

export interface JWTPayload {
  userId: string
  sessionId?: string
  username: string
  role?: string
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
    return crypto.createHash("sha256").update(token).digest("hex")
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
}
