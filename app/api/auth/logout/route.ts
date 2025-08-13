import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, decodeToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value
    const refreshToken = cookieStore.get("refresh_token")?.value

    let userId: number | null = null

    // Intentar obtener el userId del access token
    if (accessToken) {
      const decoded = verifyToken(accessToken) || decodeToken(accessToken)
      if (decoded) {
        userId = decoded.userId
        // Blacklist del access token
        await Database.blacklistToken(decoded.jti, decoded.userId, "access", "logout")
      }
    }

    // Procesar refresh token
    if (refreshToken) {
      const decoded = verifyToken(refreshToken) || decodeToken(refreshToken)
      if (decoded) {
        userId = userId || decoded.userId
        // Revocar refresh token en la base de datos
        await Database.revokeRefreshToken(decoded.jti, decoded.userId)
        // Blacklist del refresh token
        await Database.blacklistToken(decoded.jti, decoded.userId, "refresh", "logout")
      }
    }

    // Crear respuesta
    const response = NextResponse.json({ success: true })

    // Limpiar cookies
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
