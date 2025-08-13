import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, createTokenPair, decodeToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 })
    }

    // Verificar el refresh token
    const decoded = verifyToken(refreshToken)
    if (!decoded || decoded.type !== "refresh") {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Verificar que el token no esté en la blacklist
    const isBlacklisted = await Database.isTokenBlacklisted(decoded.jti)
    if (isBlacklisted) {
      return NextResponse.json({ error: "Token has been revoked" }, { status: 401 })
    }

    // Verificar que el refresh token existe en la base de datos
    const storedToken = await Database.getRefreshToken(decoded.jti)
    if (!storedToken) {
      return NextResponse.json({ error: "Refresh token not found" }, { status: 401 })
    }

    // Obtener información del usuario
    const user = await Database.getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Crear nuevo par de tokens
    const tokenPair = createTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: [], // TODO: Get user roles
    })

    // Revocar el refresh token anterior
    await Database.revokeRefreshToken(decoded.jti)

    // Almacenar el nuevo refresh token
    const newRefreshTokenDecoded = decodeToken(tokenPair.refreshToken)
    if (newRefreshTokenDecoded && newRefreshTokenDecoded.exp) {
      await Database.storeRefreshToken({
        user_id: user.id,
        token_jti: newRefreshTokenDecoded.jti,
        expires_at: newRefreshTokenDecoded.exp, // Pasar como timestamp Unix
        user_agent: request.headers.get("user-agent") || undefined,
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      })
    }

    // Actualizar última renovación de token
    await Database.updateUserLogin(user.id)

    const response = NextResponse.json({
      message: "Tokens refreshed successfully",
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
        tokenType: "Bearer",
      },
    })

    // Actualizar cookies
    response.cookies.set("access_token", tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
    })

    response.cookies.set("refresh_token", tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".wikipeoplestats.org" : undefined,
    })

    return response
  } catch (error) {
    console.error("Error refreshing tokens:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
