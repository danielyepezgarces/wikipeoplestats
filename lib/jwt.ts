import jwt from "jsonwebtoken"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JWTPayload {
  userId: string
  username: string
  email?: string
  sessionId?: string
  iat: number
  exp: number
}

export class JWTManager {
  static generateToken(payload: {
    userId: number
    username: string
    email?: string | null
    sessionId?: number
  }): string {
    const tokenPayload: Omit<JWTPayload, "iat" | "exp"> = {
      userId: payload.userId.toString(),
      username: payload.username,
      email: payload.email || undefined,
      sessionId: payload.sessionId?.toString(),
    }

    return jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "30d",
    })
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      return decoded
    } catch (error) {
      console.error("JWT verification failed:", error)
      return null
    }
  }

  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  static decodeTokenWithoutVerification(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload
    } catch (error) {
      console.error("JWT decode failed:", error)
      return null
    }
  }
}
