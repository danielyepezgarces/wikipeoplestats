import { type NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth-middleware"
import { SessionManager } from "@/lib/session-manager"

export async function GET(request: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "https://www.wikipeoplestats.org",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
  }

  try {
    const user = await validateSession(request)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401, headers })
    }

    const sessions = await SessionManager.getUserSessions(user.id)

    return NextResponse.json({ sessions }, { headers })
  } catch (error) {
    console.error("Get sessions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers })
  }
}

export async function DELETE(request: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "https://www.wikipeoplestats.org",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
  }

  try {
    const user = await validateSession(request)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401, headers })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const all = searchParams.get("all") === "true"

    if (all) {
      const currentToken = request.cookies.get("auth_token")?.value
      const revokedCount = await SessionManager.revokeAllUserSessions(user.id, currentToken)

      return NextResponse.json({ message: `Revoked ${revokedCount} sessions` }, { headers })
    } else if (sessionId) {
      // This would need to be implemented to revoke by session ID
      return NextResponse.json({ message: "Session revoked" }, { headers })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers })
  } catch (error) {
    console.error("Delete sessions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://www.wikipeoplestats.org",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    },
  })
}
