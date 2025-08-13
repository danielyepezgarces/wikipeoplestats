import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")
  const { pathname } = request.nextUrl

  // Handle CORS for all requests
  const isDevelopment = process.env.NODE_ENV === "development"
  const isLocalhostOrigin = origin && (origin.includes("localhost") || origin.includes("127.0.0.1"))
  const isWikipeopleOrigin = origin && origin.includes("wikipeoplestats.org")

  // Create response with CORS headers
  const response = NextResponse.next()

  if ((isDevelopment && isLocalhostOrigin) || isWikipeopleOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  }

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    })
  }

  // Skip middleware for static files and certain API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/callback") ||
    pathname.includes(".") ||
    pathname === "/login"
  ) {
    return response
  }

  // Protected paths that require authentication
  const protectedPaths = ["/dashboard", "/api/admin", "/api/auth/sessions", "/api/auth/logout"]

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtectedPath) {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      if (pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: response.headers,
        },
      )
    }

    // For dashboard routes, validate session
    if (pathname.startsWith("/dashboard")) {
      try {
        const userSession = await SessionManager.validateSession(token)

        if (!userSession) {
          return NextResponse.redirect(new URL("/login", request.url))
        }
      } catch (error) {
        console.error("Middleware session validation error:", error)
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
