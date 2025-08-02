import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/admin", "/api/admin"]

// Rutas públicas que no requieren autenticación
const publicRoutes = ["/", "/login", "/chapters", "/users", "/compare", "/genders", "/search"]

// Rutas de API que no requieren autenticación
const publicApiRoutes = ["/api/auth/login", "/api/auth/callback", "/api/chapters", "/api/stats", "/api/graph"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir archivos estáticos y API públicas
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    publicApiRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next()
  }

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  if (!isProtectedRoute && !isPublicRoute) {
    // Ruta no definida, permitir por defecto
    return NextResponse.next()
  }

  // Obtener session ID de las cookies
  const sessionId = request.cookies.get("session_id")?.value

  if (isProtectedRoute) {
    if (!sessionId) {
      // Redirigir a login si no hay sesión
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verificar que la sesión sea válida (verificación rápida)
    if (!SessionManager.isValidSessionId(sessionId)) {
      // Session ID inválido, limpiar cookie y redirigir
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("session_id")
      response.cookies.delete("user_info")
      return response
    }

    // Para rutas protegidas, la verificación completa se hace en el servidor
    // El middleware solo hace verificaciones básicas por rendimiento
  }

  if (isPublicRoute && sessionId && SessionManager.isValidSessionId(sessionId)) {
    // Usuario autenticado accediendo a ruta pública como /login
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
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
