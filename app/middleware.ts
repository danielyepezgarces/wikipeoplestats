import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/admin", "/profile"]

// Rutas que solo pueden acceder usuarios no autenticados
const authRoutes = ["/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionId = request.cookies.get("session_id")?.value

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  try {
    let isAuthenticated = false

    if (sessionId && SessionManager.isValidSessionId(sessionId)) {
      // Verificar sesión
      const sessionData = await SessionManager.getSession(sessionId)
      isAuthenticated = !!sessionData
    }

    // Redirigir usuarios no autenticados desde rutas protegidas
    if (isProtectedRoute && !isAuthenticated) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Redirigir usuarios autenticados desde rutas de auth
    if (isAuthRoute && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Limpiar cookie inválida
    if (sessionId && !isAuthenticated) {
      const response = NextResponse.next()
      response.cookies.delete("session_id")
      return response
    }

    return NextResponse.next()
  } catch (error) {
    console.error("❌ Middleware error:", error)

    // En caso de error, limpiar cookie y continuar
    if (sessionId) {
      const response = NextResponse.next()
      response.cookies.delete("session_id")
      return response
    }

    return NextResponse.next()
  }
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
