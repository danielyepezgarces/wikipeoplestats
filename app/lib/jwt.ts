// lib/jwt.ts
import jwt from "jsonwebtoken"
import crypto from "crypto"
import type { User } from "./database"

export interface JWTPayload {
  userId: number
  username: string
  email?: string
  iat: number
  exp: number
}

export class JWTManager {
  private static secret = process.env.JWT_SECRET || "your-secret-key"

  static generateToken(user: User): string {
    const payload: Omit<JWTPayload, "iat" | "exp"> = {
      userId: user.id,
      username: user.username,
      email: user.email,
    }

    return jwt.sign(payload, this.secret, {
      expiresIn: "30d",
    })
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.secret) as JWTPayload
    } catch (error) {
      console.error("JWT verification error:", error)
      return null
    }
  }

  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex")
  }
}
