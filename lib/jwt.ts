import jwt from "jsonwebtoken"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"

export interface TokenPayload {
  userId: number
  username: string
  email?: string
  roles: string[]
  type: "access" | "refresh"
  jti: string
  iat?: number
  exp?: number
}

export interface UserTokenData {
  userId: number
  username: string
  email?: string
  roles: string[]
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
  refreshTokenExpiry: number
}

function generateJTI(): string {
  return crypto.randomBytes(16).toString("hex")
}

export function createAccessToken(userData: UserTokenData): { token: string; expiresAt: number; jti: string } {
  const jti = generateJTI()
  const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60 // 15 minutes

  const payload: TokenPayload = {
    userId: userData.userId,
    username: userData.username,
    email: userData.email,
    roles: userData.roles,
    type: "access",
    jti,
  }

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    jwtid: jti,
  })

  return { token, expiresAt, jti }
}

export function createRefreshToken(userData: UserTokenData): { token: string; expiresAt: number; jti: string } {
  const jti = generateJTI()
  const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days

  const payload: TokenPayload = {
    userId: userData.userId,
    username: userData.username,
    email: userData.email,
    roles: userData.roles,
    type: "refresh",
    jti,
  }

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    jwtid: jti,
  })

  return { token, expiresAt, jti }
}

export function createTokenPair(userData: UserTokenData): TokenPair & { accessJti: string; refreshJti: string } {
  const accessToken = createAccessToken(userData)
  const refreshToken = createRefreshToken(userData)

  return {
    accessToken: accessToken.token,
    refreshToken: refreshToken.token,
    expiresIn: 15 * 60, // 15 minutes in seconds
    refreshTokenExpiry: refreshToken.expiresAt,
    accessJti: accessToken.jti,
    refreshJti: refreshToken.jti,
  }
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload
    return decoded
  } catch (error) {
    console.error("Token decode failed:", error)
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as TokenPayload
    if (!decoded || !decoded.exp) return true
    return decoded.exp < Math.floor(Date.now() / 1000)
  } catch (error) {
    return true
  }
}

export function shouldRefreshToken(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as TokenPayload
    if (!decoded || !decoded.exp) return true
    const timeRemaining = decoded.exp - Math.floor(Date.now() / 1000)
    return timeRemaining < 300 // Less than 5 minutes
  } catch (error) {
    return true
  }
}
