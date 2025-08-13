import { type NextRequest, NextResponse } from "next/server"
import { JWTManager } from "@/lib/jwt"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  console.log("🔍 Procesando logout...")

  try {
    const accessToken = request.cookies.get("auth_token")?.value
    const refreshToken = request.cookies.get("refresh_token")?.value

    // Si hay tokens, agregarlos a la blacklist
    if (accessToken) {
      const decoded = JWTManager.verifyToken(accessToken, "access")
      if (decoded) {
        await Database.blacklistToken(decoded.jti, Number.parseInt(decoded.userId), "access", "logout")
      }
    }

    if (refreshToken) {
      const decoded = JWTManager.verifyToken(refreshToken, "refresh")
      if (decoded) {
        await Database.blacklistToken(decoded.jti, Number.parseInt(decoded.userId), "refresh", "logout")
        await Database.revokeRefreshToken(decoded.jti)
      }
    }

    const domain = process.env.NEXT_PUBLIC_DOMAIN || ".wikipeoplestats.org"

    const response = NextResponse.json({ message: "Sesión cerrada exitosamente" })

    // Limpiar cookies
    response.cookies.set("auth_token", "", {
      domain: domain,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
    })

    response.cookies.set("refresh_token", "", {
      domain: domain,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
    })

    response.cookies.set("user_info", "", {
      domain: domain,
      path: "/",
      secure: true,
      sameSite: "lax",
      maxAge: 0,
    })

    console.log("✅ Cookies limpiadas")

    return response
  } catch (error) {
    console.error("❌ Error cerrando sesión:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
