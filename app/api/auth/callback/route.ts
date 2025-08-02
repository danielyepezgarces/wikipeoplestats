import { type NextRequest, NextResponse } from "next/server"
import { OAuthService } from "@/lib/oauth"
import { SessionManager } from "@/lib/session-manager"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code || !state) {
      return NextResponse.redirect(new URL("/login?error=missing_params", request.url))
    }

    // Verificar el estado CSRF
    const storedState = request.cookies.get("oauth_state")?.value
    if (state !== storedState) {
      return NextResponse.redirect(new URL("/login?error=invalid_state", request.url))
    }

    // Intercambiar código por token de acceso
    const tokenData = await OAuthService.exchangeCodeForToken(code)
    if (!tokenData) {
      return NextResponse.redirect(new URL("/login?error=token_exchange_failed", request.url))
    }

    // Obtener información del usuario
    const userInfo = await OAuthService.getUserInfo(tokenData.access_token)
    if (!userInfo) {
      return NextResponse.redirect(new URL("/login?error=user_info_failed", request.url))
    }

    // Buscar o crear usuario
    let user = await Database.getUserByWikipediaId(userInfo.sub)

    if (!user) {
      // Buscar por nombre de usuario para cuentas no reclamadas
      const existingUser = await Database.getUserByUsername(userInfo.username)

      if (existingUser && !existingUser.is_claimed) {
        // Reclamar cuenta existente
        user = await Database.claimUserAccount(existingUser.id, userInfo.sub, userInfo.email)
      } else {
        // Crear nueva cuenta
        user = await Database.createUser({
          wikimedia_id: userInfo.sub,
          username: userInfo.username,
          email: userInfo.email,
          avatar_url: userInfo.avatar_url,
          registration_date: userInfo.registration_date,
          is_claimed: true,
        })
      }
    }

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=user_creation_failed", request.url))
    }

    // Actualizar último login
    await Database.updateUserLogin(user.id)

    // Asignar rol por defecto si es necesario
    await Database.assignDefaultRole(user.id)

    // Crear sesión del servidor
    const sessionId = await SessionManager.createSession(user, {
      origin: request.headers.get("origin") || "unknown",
      userAgent: request.headers.get("user-agent"),
      ipAddress: request.ip || request.headers.get("x-forwarded-for") || "unknown",
    })

    // Configurar cookie de sesión
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: "/",
    })

    // Limpiar cookie de estado OAuth
    response.cookies.delete("oauth_state")

    return response
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url))
  }
}
