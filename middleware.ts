import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas que requieren autenticación
  const protectedRoutes = ["/dashboard", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const sessionId = request.cookies.get("session_id")?.value

    if (!sessionId || !SessionManager.isValidSessionId(sessionId)) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verificar sesión en la base de datos (opcional para middleware)
    // Para mejor rendimiento, solo validamos el formato aquí
    // La verificación completa se hace en las rutas API
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
