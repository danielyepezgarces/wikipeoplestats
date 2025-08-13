import jwt from "jsonwebtoken"
import { randomUUID } from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key"
const ACCESS_TOKEN_EXPIRY = "15m"
const REFRESH_TOKEN_EXPIRY = "7d"

export interface TokenPayload {
  userId: number
  username: string
  email: string | null
  roles: string[]
  jti: string
  type: "access" | "refresh"
  iat: number
  exp: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  accessJti: string
  refreshJti: string
  accessTokenExpiry: number
  refreshTokenExpiry: number
}

export function createAccessToken(userData: {
  userId: number
  username: string
  email: string | null
  roles: string[]
}): { token: string; jti: string; expiresAt: number } {
  const jti = randomUUID()
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + 15 * 60 // 15 minutes

  const payload = {
    userId: userData.userId,
    username: userData.username,
    email: userData.email,
    roles: userData.roles,
    jti: jti,
    type: "access",
  }

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  })

  return { token, jti, expiresAt }
}

export function createRefreshToken(userData: {
  userId: number
  username: string
  email: string | null
  roles: string[]
}): { token: string; jti: string; expiresAt: number } {
  const jti = randomUUID()
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + 7 * 24 * 60 * 60 // 7 days

  const payload = {
    userId: userData.userId,
    username: userData.username,
    email: userData.email,
    roles: userData.roles,
    jti: jti,
    type: "refresh",
  }

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  })

  return { token, jti, expiresAt }
}

export function createTokenPair(userData: {
  userId: number
  username: string
  email: string | null
  roles: string[]
}): TokenPair {
  const accessToken = createAccessToken(userData)
  const refreshToken = createRefreshToken(userData)

  return {
    accessToken: accessToken.token,
    refreshToken: refreshToken.token,
    accessJti: accessToken.jti,
    refreshJti: refreshToken.jti,
    accessTokenExpiry: accessToken.expiresAt,
    refreshTokenExpiry: refreshToken.expiresAt,
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

    const now = Math.floor(Date.now() / 1000)
    return decoded.exp < now
  } catch (error) {
    return true
  }
}

export function shouldRefreshToken(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as TokenPayload
    if (!decoded || !decoded.exp) return true

    const now = Math.floor(Date.now() / 1000)
    const timeRemaining = decoded.exp - now
    return timeRemaining < 300 // Less than 5 minutes
  } catch (error) {
    return true
  }
}
