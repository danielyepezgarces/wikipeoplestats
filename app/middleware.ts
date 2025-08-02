import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SessionManager } from "@/lib/session-manager"

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/admin", "/profile", "/settings"]

// Rutas que solo pueden acceder usuarios no autenticados
const authRoutes = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionId = request.cookies.get("session_id")?.value

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Si es una ruta protegida, verificar autenticación
  if (isProtectedRoute) {
    if (!sessionId) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verificar que la sesión sea válida
    const session = await SessionManager.getSession(sessionId)
    if (!session) {
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("session_id")
      response.cookies.delete("user_info")
      return response
    }
  }

  // Si es una ruta de auth y el usuario ya está autenticado, redirigir al dashboard
  if (isAuthRoute && sessionId) {
    const session = await SessionManager.getSession(sessionId)
    if (session) {
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
