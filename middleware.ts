import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { JWTManager } from "@/lib/jwt"
import { Database } from "@/lib/database"
import { getAuthContext } from "./lib/auth-middleware"

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")
  const hostname = request.nextUrl.hostname
  const { pathname } = request.nextUrl

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

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/callback") ||
    pathname.startsWith("/api/auth/verify") ||
    pathname.includes(".") ||
    pathname === "/login"
  ) {
    return NextResponse.next()
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

    try {
      // Initialize database tables first
      await Database.initializeTables()

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
      const isBlacklisted = await Database.isTokenBlacklisted(token)
      if (isBlacklisted) {
        const response = request.nextUrl.pathname.startsWith("/dashboard")
          ? NextResponse.redirect(new URL("/login", request.url))
          : NextResponse.json({ error: "Token revoked" }, { status: 401 })

        response.cookies.delete("auth_token")
        return response
      }

      // Verificar si la sesión existe y está activa
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

      // Protected routes that require authentication
      const protectedRoutes = ["/dashboard", "/admin"]
      const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

      if (isProtectedRoute) {
        try {
          const auth = await getAuthContext(request)

          if (!auth) {
            // Redirect to login if not authenticated
            const loginUrl = new URL("/login", request.url)
            loginUrl.searchParams.set("redirect", pathname)
            return NextResponse.redirect(loginUrl)
          }

          // Add auth context to headers for API routes
          const response = NextResponse.next()
          response.headers.set("x-user-id", auth.userId.toString())
          response.headers.set("x-username", auth.username)
          response.headers.set("x-session-id", auth.sessionId.toString())

          return response
        } catch (error) {
          console.error("Middleware auth error:", error)
          const loginUrl = new URL("/login", request.url)
          loginUrl.searchParams.set("redirect", pathname)
          return NextResponse.redirect(loginUrl)
        }
      }
    } catch (error) {
      console.error("Middleware error:", error)

      // En caso de error, permitir continuar pero loggear
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        console.warn("Database error in middleware, redirecting to login")
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Para API routes, devolver error 500
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
