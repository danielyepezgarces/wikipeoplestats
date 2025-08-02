import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value
  const { pathname } = request.nextUrl

  // Rutas que requieren autenticación
  const protectedRoutes = ["/dashboard", "/admin", "/api/auth/me", "/api/auth/sessions"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Si es una ruta protegida y no hay session ID, redirigir al login
  if (isProtectedRoute && !sessionId) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Validar formato del session ID si existe
  if (sessionId && !/^[A-Za-z0-9_-]{22}$/.test(sessionId)) {
    // Session ID inválido, limpiar cookie y redirigir
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("session_id")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/auth/me", "/api/auth/sessions", "/api/admin/:path*"],
}
