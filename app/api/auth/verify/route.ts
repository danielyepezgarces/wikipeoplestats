import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, shouldRefreshToken, createAccessToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ error: "No tokens provided" }, { status: 401 })
    }

    let currentToken = accessToken
    let shouldSetNewCookie = false

    // Si no hay access token o está expirado, intentar usar refresh token
    if (!accessToken || shouldRefreshToken(accessToken)) {
      if (!refreshToken) {
        return NextResponse.json({ error: "Access token expired and no refresh token available" }, { status: 401 })
      }

      // Verificar refresh token
      const refreshDecoded = verifyToken(refreshToken)
      if (!refreshDecoded || refreshDecoded.type !== "refresh") {
        return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
      }

      // Verificar que el refresh token no esté blacklisted
      const isBlacklisted = await Database.isTokenBlacklisted(refreshDecoded.jti)
      if (isBlacklisted) {
        return NextResponse.json({ error: "Refresh token has been revoked" }, { status: 401 })
      }

      // Verificar que el refresh token existe en la base de datos
      const storedToken = await Database.getRefreshTokenByJti(refreshDecoded.jti)
      if (!storedToken) {
        return NextResponse.json({ error: "Refresh token not found" }, { status: 401 })
      }

      // Obtener información del usuario
      const user = await Database.getUserById(refreshDecoded.userId)
      if (!user || !user.is_active) {
        return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
      }

      // Crear nuevo access token
      const { token: newAccessToken } = createAccessToken({
        userId: user.id,
        username: user.username,
        email: user.email,
        roles: [], // TODO: Obtener roles del usuario
      })

      currentToken = newAccessToken
      shouldSetNewCookie = true

      // Actualizar último uso del refresh token
      await Database.updateRefreshTokenLastUsed(refreshDecoded.jti)
    }

    // Verificar el access token actual
    const decoded = verifyToken(currentToken!)
    if (!decoded || decoded.type !== "access") {
      return NextResponse.json({ error: "Invalid access token" }, { status: 401 })
    }

    // Verificar que el token no esté blacklisted
    const isBlacklisted = await Database.isTokenBlacklisted(decoded.jti)
    if (isBlacklisted) {
      return NextResponse.json({ error: "Access token has been revoked" }, { status: 401 })
    }

    // Obtener información actualizada del usuario
    const user = await Database.getUserById(decoded.userId)
    if (!user || !user.is_active) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        is_claimed: user.is_claimed,
      },
      token: {
        jti: decoded.jti,
        exp: decoded.exp,
        iat: decoded.iat,
      },
    })

    // Si se generó un nuevo access token, configurar la cookie
    if (shouldSetNewCookie) {
      response.cookies.set("access_token", currentToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60, // 15 minutos
        path: "/",
      })
    }

    return response
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
