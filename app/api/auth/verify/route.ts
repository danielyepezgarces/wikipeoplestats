import { type NextRequest, NextResponse } from "next/server"
import { JWTManager } from "@/lib/jwt"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("auth_token")?.value
    const refreshToken = request.cookies.get("refresh_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "No access token provided" }, { status: 401 })
    }

    // Verificar access token
    let decoded = JWTManager.verifyToken(accessToken, "access")
    let newAccessToken = null

    // Si el access token ha expirado, intentar renovarlo con el refresh token
    if (!decoded && refreshToken) {
      const refreshDecoded = JWTManager.verifyToken(refreshToken, "refresh")

      if (refreshDecoded) {
        // Verificar si el refresh token está en la blacklist
        const isBlacklisted = await Database.isTokenBlacklisted(refreshDecoded.jti)
        if (!isBlacklisted) {
          // Verificar si el refresh token existe en la base de datos
          const storedToken = await Database.getRefreshTokenByJti(refreshDecoded.jti)
          if (storedToken) {
            // Generar nuevo access token
            newAccessToken = JWTManager.refreshAccessToken(refreshToken)
            if (newAccessToken) {
              decoded = JWTManager.verifyToken(newAccessToken, "access")
              await Database.updateRefreshTokenLastUsed(refreshDecoded.jti)
            }
          }
        }
      }
    }

    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Verificar si el token está en la blacklist
    const isBlacklisted = await Database.isTokenBlacklisted(decoded.jti)
    if (isBlacklisted) {
      return NextResponse.json({ error: "Token has been revoked" }, { status: 401 })
    }

    // Obtener información del usuario
    const user = await Database.getUserById(Number.parseInt(decoded.userId))
    if (!user || !user.is_active) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        is_claimed: user.is_claimed,
        last_login: user.last_login,
      },
      token: {
        jti: decoded.jti,
        exp: decoded.exp,
        iat: decoded.iat,
      },
    })

    // Si se generó un nuevo access token, actualizar la cookie
    if (newAccessToken) {
      const domain = process.env.NEXT_PUBLIC_DOMAIN || ".wikipeoplestats.org"
      response.cookies.set("auth_token", newAccessToken, {
        domain: domain,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 15 * 60, // 15 minutos
      })
    }

    return response
  } catch (error) {
    console.error("❌ Error verifying token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
