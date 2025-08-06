import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import { JWTManager } from "@/lib/jwt"
import { Database } from "@/lib/database"

export const runtime = 'nodejs'; // Force Node.js runtime

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

  // Proteger rutas del dashboard y API admin
  const protectedPaths = [
    "/dashboard",
    "/api/admin",
    "/api/auth/sessions",
  ]

  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Permitir rutas de autenticación sin verificación
  const authPaths = ["/api/auth/login", "/api/auth/callback", "/api/auth/verify", "/api/auth/logout"]

  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Validación de sesión para rutas protegidas
  if (isProtectedPath && !isAuthPath) {
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validar sesión de forma asíncrona (solo para rutas críticas)
    try {
      const session = await SessionManager.getSessionWithUser(sessionToken)

      if (!session) {
        const response = request.nextUrl.pathname.startsWith("/dashboard")
          ? NextResponse.redirect(new URL("/login", request.url))
          : NextResponse.json({ error: "Session expired" }, { status: 401 })

        response.cookies.delete("session_token")
        return response
      }

      // La validación ya actualiza la última actividad
    } catch (error) {
      console.error("Error checking session:", error)
      // En caso de error, redirigir a login por seguridad
      const response = request.nextUrl.pathname.startsWith("/dashboard")
        ? NextResponse.redirect(new URL("/login", request.url))
        : NextResponse.json({ error: "Session validation failed" }, { status: 401 })

      response.cookies.delete("session_token")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  runtime: 'nodejs', 
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/auth/sessions/:path*"
  ],
}
