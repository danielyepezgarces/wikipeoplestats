import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function GET(request: NextRequest) {
  try {
    // Add CORS headers
    const origin = request.headers.get("origin")
    const response = new NextResponse()

    // Allow requests from wikipeoplestats.org subdomains
    if (origin && origin.includes("wikipeoplestats.org")) {
      response.headers.set("Access-Control-Allow-Origin", origin)
      response.headers.set("Access-Control-Allow-Credentials", "true")
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    }

    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false, user: null },
        {
          status: 200,
          headers: response.headers,
        },
      )
    }

    // Validate session
    const userSession = await SessionManager.validateSession(token)
    if (!userSession) {
      const res = NextResponse.json(
        { authenticated: false, user: null },
        {
          status: 200,
          headers: response.headers,
        },
      )
      res.cookies.delete("auth_token")
      return res
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: userSession.id,
          username: userSession.username,
          email: userSession.email,
          avatar_url: userSession.avatar_url,
          is_claimed: userSession.is_claimed,
        },
      },
      {
        status: 200,
        headers: response.headers,
      },
    )
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 })
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin")

  if (origin && origin.includes("wikipeoplestats.org")) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  return new NextResponse(null, { status: 200 })
}
