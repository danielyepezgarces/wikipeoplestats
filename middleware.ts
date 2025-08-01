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

  // Proteger rutas del dashboard y API
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    (request.nextUrl.pathname.startsWith("/api") &&
      !request.nextUrl.pathname.startsWith("/api/auth/login") &&
      !request.nextUrl.pathname.startsWith("/api/auth/callback"))
  ) {
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
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Verificar si el token está en la blacklist
    try {
      const isBlacklisted = await Database.isTokenBlacklisted(token)
      if (isBlacklisted) {
        // Limpiar la cookie
        const response = request.nextUrl.pathname.startsWith("/dashboard")
          ? NextResponse.redirect(new URL("/login", request.url))
          : NextResponse.json({ error: "Token revoked" }, { status: 401 })

        response.cookies.delete("auth_token")
        return response
      }
    } catch (error) {
      console.error("Error checking token blacklist:", error)
      // En caso de error, permitir continuar pero loggear el error
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
