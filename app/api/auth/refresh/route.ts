import { type NextRequest, NextResponse } from "next/server"
import { JWTManager } from "@/lib/jwt"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    // Verificar el refresh token
    const decoded = JWTManager.verifyToken(refreshToken, "refresh")
    if (!decoded) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Verificar si el token está en la blacklist
    const isBlacklisted = await Database.isTokenBlacklisted(decoded.jti)
    if (isBlacklisted) {
      return NextResponse.json({ error: "Refresh token has been revoked" }, { status: 401 })
    }

    // Verificar si el refresh token existe en la base de datos
    const storedToken = await Database.getRefreshTokenByJti(decoded.jti)
    if (!storedToken) {
      return NextResponse.json({ error: "Refresh token not found" }, { status: 401 })
    }

    // Actualizar el último uso del refresh token
    await Database.updateRefreshTokenLastUsed(decoded.jti)

    // Generar nuevo access token
    const newAccessToken = JWTManager.refreshAccessToken(refreshToken)
    if (!newAccessToken) {
      return NextResponse.json({ error: "Failed to generate new access token" }, { status: 500 })
    }

    // Calcular tiempo de expiración
    const expiresIn = 15 * 60 // 15 minutos en segundos

    return NextResponse.json({
      accessToken: newAccessToken,
      expiresIn,
      tokenType: "Bearer",
    })
  } catch (error) {
    console.error("❌ Error refreshing token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
