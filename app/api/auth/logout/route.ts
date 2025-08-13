import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"

export async function POST(request: NextRequest) {
  console.log("🔍 Processing logout...")

  try {
    const domain = process.env.NEXT_PUBLIC_DOMAIN || ".wikipeoplestats.org"
    const token = request.cookies.get("auth_token")?.value

    // Revoke session if token exists
    if (token) {
      await SessionManager.revokeSession(token)
    }

    const response = NextResponse.json({ message: "Session closed successfully" })

    // Clear cookies
    response.cookies.set("auth_token", "", {
      domain: domain,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
    })

    response.cookies.set("user_info", "", {
      domain: domain,
      path: "/",
      secure: true,
      sameSite: "lax",
      maxAge: 0,
    })

    console.log("✅ Cookies cleared and session revoked")

    return response
  } catch (error) {
    console.error("❌ Error closing session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
