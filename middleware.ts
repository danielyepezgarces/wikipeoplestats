import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ✅ Removemos el runtime nodejs - El middleware SIEMPRE usa Edge Runtime
// ✅ Removemos las importaciones que usan Node.js modules

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")
  const hostname = request.nextUrl.hostname

  // Allow CORS for localhost during development and wikipeoplestats.org subdomains
  const isDevelopment = process.env.NODE_ENV === "development"
  const isLocalhostOrigin = origin && (origin.includes("localhost") || origin.includes("127.0.0.1"))
  const isWikipeopleOrigin = origin && origin.includes("wikipeoplestats.org")

  // Handle CORS
  if ((isDevelopment && isLocalhostOrigin) || isWikipeopleOrigin) {
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    // Si es OPTIONS, retornar inmediatamente
    if (request.method === "OPTIONS") {
      return response
    }
  }

  // Proteger rutas del dashboard y API admin
  const protectedPaths = [
    "/dashboard",
    "/api/admin",
    "/api/auth/sessions",
  ]

  const isProtectedPath = protectedPaths.some((path) => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Permitir rutas de autenticación sin verificación
  const authPaths = [
    "/api/auth/login", 
    "/api/auth/callback", 
    "/api/auth/verify", 
    "/api/auth/logout"
  ]

  const isAuthPath = authPaths.some((path) => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Validación de sesión para rutas protegidas
  if (isProtectedPath && !isAuthPath) {
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ Usar la API interna de verify en lugar de acceso directo a BD
    try {
      const verifyUrl = new URL("/api/auth/verify", request.url)
      
      const verifyResponse = await fetch(verifyUrl, {
        method: "GET",
        headers: {
          "Cookie": `session_token=${sessionToken}`,
          "Content-Type": "application/json",
          // Agregar un header para identificar que viene del middleware
          "X-Middleware-Request": "true"
        },
        // Importante: no usar redirect automático
        redirect: "manual"
      })

      // Si la verificación falla
      if (!verifyResponse.ok) {
        const clearCookieResponse = request.nextUrl.pathname.startsWith("/dashboard")
          ? NextResponse.redirect(new URL("/login", request.url))
          : NextResponse.json({ error: "Session expired" }, { status: 401 })

        clearCookieResponse.cookies.set("session_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 0, // Eliminar cookie
          path: "/"
        })

        return clearCookieResponse
      }

      // ✅ Verificar que la respuesta contiene datos válidos del usuario
      try {
        const sessionData = await verifyResponse.json()
        
        // Verificar que tenemos datos del usuario válidos
        if (!sessionData.user || !sessionData.user.id) {
          throw new Error("Invalid session data structure")
        }

        // Opcional: Verificar permisos específicos para ciertas rutas
        if (request.nextUrl.pathname.startsWith("/api/admin")) {
          const userRoles = sessionData.user.roles || []
          const hasAdminRole = userRoles.includes("super_admin") || userRoles.includes("chapter_admin")
          
          if (!hasAdminRole) {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
          }
        }

      } catch (parseError) {
        console.error("Error parsing session data:", parseError)
        
        const errorResponse = request.nextUrl.pathname.startsWith("/dashboard")
          ? NextResponse.redirect(new URL("/login", request.url))
          : NextResponse.json({ error: "Invalid session data" }, { status: 401 })

        errorResponse.cookies.set("session_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 0,
          path: "/"
        })

        return errorResponse
      }

      // ✅ Sesión válida, continuar
      const response = NextResponse.next()
      
      // Opcional: Actualizar headers de CORS si es necesario
      if ((isDevelopment && isLocalhostOrigin) || isWikipeopleOrigin) {
        response.headers.set("Access-Control-Allow-Origin", origin)
        response.headers.set("Access-Control-Allow-Credentials", "true")
      }

      return response

    } catch (error) {
      console.error("Error checking session in middleware:", error)
      
      // En caso de error de red/servidor, redirigir a login por seguridad
      const errorResponse = request.nextUrl.pathname.startsWith("/dashboard")
        ? NextResponse.redirect(new URL("/login", request.url))
        : NextResponse.json({ error: "Session validation failed" }, { status: 500 })

      errorResponse.cookies.set("session_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/"
      })

      return errorResponse
    }
  }

  // Para rutas no protegidas, aplicar CORS si es necesario
  if ((isDevelopment && isLocalhostOrigin) || isWikipeopleOrigin) {
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
    return response
  }

  return NextResponse.next()
}

export const config = {
  // ✅ Removemos runtime: 'nodejs' - no es válido para middleware
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*", 
    "/api/auth/sessions/:path*",
    // Opcional: agregar rutas que necesiten CORS
    "/api/:path*"
  ],
}