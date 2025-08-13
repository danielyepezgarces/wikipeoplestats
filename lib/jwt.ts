import jwt from "jsonwebtoken"
import { randomBytes } from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const ACCESS_TOKEN_EXPIRES_IN = "15m" // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = "7d" // 7 days

export interface TokenPayload {
  userId: number
  username: string
  email: string | null
  roles: string[]
  jti: string
  type: "access" | "refresh"
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
  refreshTokenExpiry: number
}

function generateJTI(): string {
  return randomBytes(16).toString("hex")
}

export function createTokenPair(userData: {
  userId: number
  username: string
  email: string | null
  roles: string[]
}): TokenPair {
  const now = Math.floor(Date.now() / 1000)
  const accessTokenExpiry = now + 15 * 60 // 15 minutes
  const refreshTokenExpiry = now + 7 * 24 * 60 * 60 // 7 days

  const accessTokenPayload: TokenPayload = {
    userId: userData.userId,
    username: userData.username,
    email: userData.email,
    roles: userData.roles,
    jti: generateJTI(),
    type: "access",
  }

  const refreshTokenPayload: TokenPayload = {
    userId: userData.userId,
    username: userData.username,
    email: userData.email,
    roles: userData.roles,
    jti: generateJTI(),
    type: "refresh",
  }

  const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: "wikipeoplestats",
    audience: "wikipeoplestats-users",
  })

  const refreshToken = jwt.sign(refreshTokenPayload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: "wikipeoplestats",
    audience: "wikipeoplestats-users",
  })

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
    refreshTokenExpiry,
  }
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "wikipeoplestats",
      audience: "wikipeoplestats-users",
    }) as TokenPayload

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
    const decoded = jwt.decode(token) as any
    if (!decoded || !decoded.exp) return true

    const now = Math.floor(Date.now() / 1000)
    return decoded.exp < now
  } catch (error) {
    return true
  }
}

export function getTokenExpiry(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as any
    return decoded?.exp || null
  } catch (error) {
    return null
  }
}
