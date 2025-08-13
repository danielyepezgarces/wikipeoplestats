import jwt from "jsonwebtoken"
import { randomBytes } from "crypto"

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

// Validar fortaleza del JWT_SECRET en producción
if (process.env.NODE_ENV === "production" && JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long in production")
}

export interface JWTPayload {
  userId: number
  username: string
  email?: string
  roles?: string[]
  jti: string
  iat: number
  exp: number
  type: "access" | "refresh"
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  accessTokenExpiry: number
  refreshTokenExpiry: number
}

/**
 * Genera un identificador único para el token (JTI)
 */
export function generateJTI(): string {
  return randomBytes(16).toString("hex")
}

/**
 * Crea un access token JWT
 */
export function createAccessToken(payload: {
  userId: number
  username: string
  email?: string
  roles?: string[]
}): { token: string; jti: string; expiresAt: number } {
  const jti = generateJTI()
  const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60 // 15 minutos

  const tokenPayload: Omit<JWTPayload, "iat" | "exp"> = {
    userId: payload.userId,
    username: payload.username,
    email: payload.email,
    roles: payload.roles || [],
    jti,
    type: "access",
  }

  const token = jwt.sign(tokenPayload, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "wikipeoplestats",
    audience: "wikipeoplestats-users",
  })

  return { token, jti, expiresAt }
}

/**
 * Crea un refresh token JWT
 */
export function createRefreshToken(payload: {
  userId: number
  username: string
}): { token: string; jti: string; expiresAt: number } {
  const jti = generateJTI()
  const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 días

  const tokenPayload: Omit<JWTPayload, "iat" | "exp"> = {
    userId: payload.userId,
    username: payload.username,
    jti,
    type: "refresh",
  }

  const token = jwt.sign(tokenPayload, JWT_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: "wikipeoplestats",
    audience: "wikipeoplestats-users",
  })

  return { token, jti, expiresAt }
}

/**
 * Crea un par de tokens (access + refresh)
 */
export function createTokenPair(payload: {
  userId: number
  username: string
  email?: string
  roles?: string[]
}): TokenPair {
  const accessTokenData = createAccessToken(payload)
  const refreshTokenData = createRefreshToken({
    userId: payload.userId,
    username: payload.username,
  })

  return {
    accessToken: accessTokenData.token,
    refreshToken: refreshTokenData.token,
    accessTokenExpiry: accessTokenData.expiresAt,
    refreshTokenExpiry: refreshTokenData.expiresAt,
  }
}

/**
 * Verifica y decodifica un JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
      issuer: "wikipeoplestats",
      audience: "wikipeoplestats-users",
    }) as JWTPayload

    return decoded
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

/**
 * Decodifica un JWT sin verificar (útil para obtener información expirada)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    return decoded
  } catch (error) {
    console.error("JWT decode failed:", error)
    return null
  }
}

/**
 * Verifica si un token está expirado
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded) return true

  const now = Math.floor(Date.now() / 1000)
  return decoded.exp < now
}

/**
 * Obtiene el tiempo restante de un token en segundos
 */
export function getTokenTimeRemaining(token: string): number {
  const decoded = decodeToken(token)
  if (!decoded) return 0

  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, decoded.exp - now)
}

/**
 * Verifica si un token necesita ser renovado (menos de 5 minutos restantes)
 */
export function shouldRefreshToken(token: string): boolean {
  const timeRemaining = getTokenTimeRemaining(token)
  return timeRemaining < 300 // 5 minutos
}
