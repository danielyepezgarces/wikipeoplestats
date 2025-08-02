import jwt from "jsonwebtoken"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d"

export interface JWTPayload {
  userId: number
  username: string
  email?: string
  role?: string
  chapter?: string
  iat?: number
  exp?: number
}

/**
 * Genera un JWT token (legacy - mantenido para compatibilidad)
 */
export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "wikipeoplestats",
    audience: "wikipeoplestats-users",
  })
}

/**
 * Verifica un JWT token (legacy - mantenido para compatibilidad)
 */
export function verifyToken(token: string): JWTPayload | null {
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

/**
 * Decodifica un JWT sin verificar (útil para obtener información básica)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch (error) {
    console.error("JWT decode failed:", error)
    return null
  }
}

/**
 * Genera un hash SHA-256 de un token para almacenamiento seguro
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

/**
 * Verifica si un token ha expirado
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    if (!decoded || !decoded.exp) return true

    const now = Math.floor(Date.now() / 1000)
    return decoded.exp < now
  } catch (error) {
    return true
  }
}

/**
 * Obtiene el tiempo restante de un token en segundos
 */
export function getTokenTimeRemaining(token: string): number {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    if (!decoded || !decoded.exp) return 0

    const now = Math.floor(Date.now() / 1000)
    return Math.max(0, decoded.exp - now)
  } catch (error) {
    return 0
  }
}
