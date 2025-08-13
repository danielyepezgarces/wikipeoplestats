import jwt from "jsonwebtoken"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m" // Tokens más cortos para mayor seguridad
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"

export interface JWTPayload {
  userId: string
  username: string
  role?: string
  tokenType: "access" | "refresh"
  jti: string // JWT ID para tracking
  iat?: number
  exp?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export class JWTManager {
  static generateTokenPair(payload: {
    userId: string
    username: string
    role?: string
  }): TokenPair {
    const jti = crypto.randomUUID()

    // Access Token (corta duración)
    const accessToken = jwt.sign(
      {
        ...payload,
        tokenType: "access",
        jti: jti + "_access",
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: "wikipeoplestats",
        audience: "wikipeoplestats-users",
      },
    )

    // Refresh Token (larga duración)
    const refreshToken = jwt.sign(
      {
        userId: payload.userId,
        username: payload.username,
        tokenType: "refresh",
        jti: jti + "_refresh",
      },
      JWT_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: "wikipeoplestats",
        audience: "wikipeoplestats-users",
      },
    )

    // Calcular tiempo de expiración en segundos
    const expiresIn = this.parseExpirationTime(JWT_EXPIRES_IN)

    return {
      accessToken,
      refreshToken,
      expiresIn,
    }
  }

  static verifyToken(token: string, expectedType?: "access" | "refresh"): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: "wikipeoplestats",
        audience: "wikipeoplestats-users",
      }) as JWTPayload

      // Verificar tipo de token si se especifica
      if (expectedType && decoded.tokenType !== expectedType) {
        console.error(`Expected ${expectedType} token, got ${decoded.tokenType}`)
        return null
      }

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error("JWT token expired")
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.error("JWT token invalid:", error.message)
      } else {
        console.error("JWT verification failed:", error)
      }
      return null
    }
  }

  static refreshAccessToken(refreshToken: string): string | null {
    const decoded = this.verifyToken(refreshToken, "refresh")
    if (!decoded) {
      return null
    }

    // Generar nuevo access token
    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        tokenType: "access",
        jti: decoded.jti.replace("_refresh", "_access_new"),
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: "wikipeoplestats",
        audience: "wikipeoplestats-users",
      },
    )

    return newAccessToken
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

  static getTokenId(token: string): string | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload
      return decoded?.jti || null
    } catch (error) {
      return null
    }
  }

  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token)
    if (!expiration) return true
    return expiration.getTime() < Date.now()
  }

  private static parseExpirationTime(timeString: string): number {
    const match = timeString.match(/^(\d+)([smhd])$/)
    if (!match) return 900 // 15 minutos por defecto

    const value = Number.parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case "s":
        return value
      case "m":
        return value * 60
      case "h":
        return value * 60 * 60
      case "d":
        return value * 60 * 60 * 24
      default:
        return 900
    }
  }

  // Método para validar la fortaleza del JWT_SECRET
  static validateSecretStrength(): boolean {
    if (!JWT_SECRET || JWT_SECRET === "your-secret-key") {
      console.error("⚠️  JWT_SECRET is not set or using default value. This is insecure!")
      return false
    }

    if (JWT_SECRET.length < 32) {
      console.error("⚠️  JWT_SECRET should be at least 32 characters long for security")
      return false
    }

    return true
  }
}

// Validar la configuración al importar el módulo
if (process.env.NODE_ENV === "production") {
  JWTManager.validateSecretStrength()
}
