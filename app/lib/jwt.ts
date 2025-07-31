// lib/jwt.ts
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { User } from './database'

export interface JWTPayload {
  userId: string
  sessionId: string
  role: string
  chapter?: string
  wikipediaUsername: string
  iat: number
  exp: number
}

export class JWTManager {
  private static secret = process.env.JWT_SECRET!
  
  static generateToken(user: User, sessionId: string): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      sessionId,
      role: user.wikimedia_role,
      chapter: user.chapter_assigned,
      wikipediaUsername: user.wikipedia_username
    }
    
    return jwt.sign(payload, this.secret, {
      expiresIn: '30d',
      issuer: process.env.AUTH_DOMAIN,
      audience: process.env.DOMAIN
    })
  }
  
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.secret, {
        issuer: process.env.AUTH_DOMAIN,
        audience: process.env.DOMAIN
      }) as JWTPayload
    } catch (error) {
      return null
    }
  }
  
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }
  
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }
}
