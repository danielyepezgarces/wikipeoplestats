import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { JWTManager } from "@/lib/jwt"
import { Database } from "@/lib/database"

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")
  const hostname = request.nextUrl.hostname

  // Allow CORS for localhost during development and wikipeoplestats.org subdomains
  const isDevelopment = process.env.NODE_ENV === "development"
  const isLocalhostOrigin = origin && (origin.includes("localhost") || origin.includes("127.0.0.1"))
  const isWikipeopleOrigin = origin && origin.includes("wikipeoplestats.org")

  if ((isDevelopment && isLocalhostOrigin) || isWikipeopleOrigin) {
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return response
  }

  // Solo proteger rutas específicas del dashboard y API
  const protectedPaths = [
    "/dashboard",
    "/api/admin",
    "/api/auth/sessions",
    "/api/auth/me",
    "/api/auth/verify",
    "/api/auth/logout",
  ]

  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Permitir rutas de autenticación sin verificación
  const authPaths = ["/api/auth/login", "/api/auth/callback"]

  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !isAuthPath) {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar si el token es válido
    const decoded = JWTManager.verifyToken(token)
    if (!decoded) {
      const response = request.nextUrl.pathname.startsWith("/dashboard")
        ? NextResponse.redirect(new URL("/login", request.url))
        : NextResponse.json({ error: "Invalid token" }, { status: 401 })

      response.cookies.delete("auth_token")
      return response
    }

    // Verificar si el token está en la blacklist
    try {
      const isBlacklisted = await Database.isTokenBlacklisted(token)
      if (isBlacklisted) {
        const response = request.nextUrl.pathname.startsWith("/dashboard")
          ? NextResponse.redirect(new URL("/login", request.url))
          : NextResponse.json({ error: "Token revoked" }, { status: 401 })

        response.cookies.delete("auth_token")
        return response
      }
    } catch (error) {
      console.error("Error checking token blacklist:", error)
      // En caso de error con la blacklist, permitir continuar
      // pero loggear el error para investigación
    }

    // Verificar si la sesión existe y está activa
    try {
      const tokenHash = JWTManager.hashToken(token)
      const session = await Database.getSessionByTokenHash(tokenHash)

      if (!session || !session.is_active) {
        const response = request.nextUrl.pathname.startsWith("/dashboard")
          ? NextResponse.redirect(new URL("/login", request.url))
          : NextResponse.json({ error: "Session expired" }, { status: 401 })

        response.cookies.delete("auth_token")
        return response
      }

      // Actualizar última actividad de la sesión
      await Database.updateSessionLastUsed(session.id)
    } catch (error) {
      console.error("Error checking session:", error)
      // En caso de error con la sesión, permitir continuar
      // pero loggear el error para investigación
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/auth/sessions/:path*",
    "/api/auth/me/:path*",
    "/api/auth/verify/:path*",
    "/api/auth/logout/:path*",
  ],
}
