import { type NextRequest, NextResponse } from "next/server"
import { OAuthManager } from "@/lib/oauth"
import { Database } from "@/lib/database"
import { JWTManager } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  console.log("🔍 Procesando login...")

  try {
    const { code, state } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Código de autorización requerido" }, { status: 400 })
    }

    // Intercambiar código por token de acceso
    const tokenData = await OAuthManager.exchangeCodeForToken(code)
    if (!tokenData) {
      return NextResponse.json({ error: "Error obteniendo token de acceso" }, { status: 400 })
    }

    // Obtener información del usuario
    const userInfo = await OAuthManager.getUserInfo(tokenData.access_token)
    if (!userInfo) {
      return NextResponse.json({ error: "Error obteniendo información del usuario" }, { status: 400 })
    }

    console.log("👤 Usuario obtenido:", userInfo.username)

    // Buscar o crear usuario
    let user = await Database.getUserByWikipediaId(userInfo.sub.toString())

    if (!user) {
      // Buscar por username para usuarios no reclamados
      const existingUser = await Database.getUserByUsername(userInfo.username)

      if (existingUser && !existingUser.is_claimed) {
        // Reclamar cuenta existente
        user = await Database.claimUserAccount(existingUser.id, userInfo.sub.toString(), userInfo.email)
        console.log("✅ Cuenta reclamada para:", userInfo.username)
      } else {
        // Crear nuevo usuario
        user = await Database.createUser({
          wikimedia_id: userInfo.sub.toString(),
          username: userInfo.username,
          email: userInfo.email,
          avatar_url: userInfo.avatar_url,
          registration_date: userInfo.registered,
          is_claimed: true,
        })

        // Asignar rol por defecto
        await Database.assignDefaultRole(user.id)
        console.log("✅ Usuario creado:", userInfo.username)
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Error procesando usuario" }, { status: 500 })
    }

    // Actualizar último login
    await Database.updateUserLogin(user.id)

    // Generar tokens JWT
    const tokenPair = JWTManager.generateTokenPair({
      userId: user.id.toString(),
      username: user.username,
      role: "user", // Aquí podrías obtener el rol real del usuario
    })

    // Almacenar refresh token en la base de datos
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
    const refreshTokenJti = JWTManager.getTokenId(tokenPair.refreshToken)

    if (refreshTokenJti) {
      await Database.storeRefreshToken({
        user_id: user.id,
        token_jti: refreshTokenJti,
        expires_at: refreshTokenExpiry.toISOString(),
        user_agent: request.headers.get("user-agent") || undefined,
        ip_address:
          request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || request.ip || undefined,
      })
    }

    const domain = process.env.NEXT_PUBLIC_DOMAIN || ".wikipeoplestats.org"

    const response = NextResponse.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        is_claimed: user.is_claimed,
      },
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
        tokenType: "Bearer",
      },
    })

    // Configurar cookies seguras
    response.cookies.set("auth_token", tokenPair.accessToken, {
      domain: domain,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: tokenPair.expiresIn,
    })

    response.cookies.set("refresh_token", tokenPair.refreshToken, {
      domain: domain,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
    })

    response.cookies.set(
      "user_info",
      JSON.stringify({
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
      }),
      {
        domain: domain,
        path: "/",
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 días
      },
    )

    console.log("✅ Login completado para:", user.username)

    return response
  } catch (error) {
    console.error("❌ Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
