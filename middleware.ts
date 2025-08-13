import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { JWTManager } from "@/lib/jwt"

export function middleware(request: NextRequest) {
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

  // Proteger rutas del dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const accessToken = request.cookies.get("auth_token")?.value
    const refreshToken = request.cookies.get("refresh_token")?.value

    // Si no hay access token, verificar si hay refresh token
    if (!accessToken) {
      if (!refreshToken) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Verificar refresh token
      const refreshDecoded = JWTManager.verifyToken(refreshToken, "refresh")
      if (!refreshDecoded) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Si el refresh token es válido, permitir el acceso
      // El nuevo access token se generará en la verificación del API
      return NextResponse.next()
    }

    // Verificar access token
    const decoded = JWTManager.verifyToken(accessToken, "access")
    if (!decoded) {
      // Si el access token no es válido, verificar refresh token
      if (!refreshToken) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      const refreshDecoded = JWTManager.verifyToken(refreshToken, "refresh")
      if (!refreshDecoded) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
