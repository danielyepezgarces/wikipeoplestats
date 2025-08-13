import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, isTokenExpired, createTokenPair, decodeToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value
    const refreshToken = request.cookies.get("refresh_token")?.value

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ error: "No tokens provided" }, { status: 401 })
    }

    // Si hay access token y es válido, devolverlo
    if (accessToken && !isTokenExpired(accessToken)) {
      const decoded = verifyToken(accessToken)
      if (decoded && !(await Database.isTokenBlacklisted(decoded.jti))) {
        const user = await Database.getUserById(decoded.userId)
        if (user) {
          return NextResponse.json({
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              avatar_url: user.avatar_url,
              is_claimed: user.is_claimed,
            },
            token: accessToken,
          })
        }
      }
    }

    // Si el access token no es válido pero hay refresh token, intentar renovar
    if (refreshToken) {
      const refreshDecoded = verifyToken(refreshToken)
      if (refreshDecoded && refreshDecoded.type === "refresh") {
        // Verificar que el refresh token no esté revocado
        const storedToken = await Database.getRefreshToken(refreshDecoded.jti)
        const isBlacklisted = await Database.isTokenBlacklisted(refreshDecoded.jti)

        if (storedToken && !isBlacklisted) {
          const user = await Database.getUserById(refreshDecoded.userId)
          if (user) {
            // Crear nuevo par de tokens
            const tokenPair = createTokenPair({
              userId: user.id,
              username: user.username,
              email: user.email,
              roles: [], // TODO: Get user roles
            })

            // Revocar el refresh token anterior
            await Database.revokeRefreshToken(refreshDecoded.jti)

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

            const response = NextResponse.json({
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url,
                is_claimed: user.is_claimed,
              },
              token: tokenPair.accessToken,
              refreshed: true,
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
          }
        }
      }
    }

    return NextResponse.json({ error: "Invalid or expired tokens" }, { status: 401 })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
