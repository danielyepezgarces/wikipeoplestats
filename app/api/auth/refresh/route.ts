import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { createAccessToken, decodeToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token not provided" }, { status: 401 })
    }

    // Verificar el refresh token
    const decoded = decodeToken(refreshToken)
    if (!decoded || decoded.type !== "refresh") {
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

    // Obtener información actualizada del usuario
    const user = await Database.getUserById(decoded.userId)
    if (!user || !user.is_active) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    // Actualizar el último uso del refresh token
    await Database.updateRefreshTokenLastUsed(decoded.jti)

    // Generar nuevo access token
    const { token: newAccessToken, expiresAt } = createAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: [], // TODO: Obtener roles del usuario
    })

    // Configurar cookie del access token
    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      expiresAt,
    })

    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutos
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Error refreshing token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
