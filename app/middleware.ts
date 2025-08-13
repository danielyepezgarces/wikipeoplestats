import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/jwt"

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/admin"]

// Rutas que requieren que el usuario NO esté autenticado
const authRoutes = ["/login"]

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")
  const hostname = request.nextUrl.hostname
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get("access_token")?.value
  const refreshToken = request.cookies.get("refresh_token")?.value

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

  // Verificar si la ruta está protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Si es una ruta de autenticación y el usuario ya está autenticado
  if (isAuthRoute && accessToken) {
    const decoded = verifyToken(accessToken)
    if (decoded) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Si es una ruta protegida
  if (isProtectedRoute) {
    // Si no hay tokens, redirigir al login
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Si hay access token válido, continuar
    if (accessToken) {
      const decoded = verifyToken(accessToken)
      if (decoded && decoded.type === "access") {
        return NextResponse.next()
      }
    }

    // Si el access token no es válido pero hay refresh token, intentar renovar
    if (refreshToken) {
      const refreshDecoded = verifyToken(refreshToken)
      if (refreshDecoded && refreshDecoded.type === "refresh") {
        // Crear una respuesta que redirige a la misma página
        // El nuevo access token se configurará en el endpoint de refresh
        const response = NextResponse.next()

        // Agregar header para indicar que se necesita renovar el token
        response.headers.set("x-token-refresh-needed", "true")

        return response
      }
    }

    // Si no hay tokens válidos, redirigir al login
    return NextResponse.redirect(new URL("/login", request.url))
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
