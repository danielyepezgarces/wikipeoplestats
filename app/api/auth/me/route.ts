import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles || [],
      chapter_id: user.chapter_id,
      chapter_admin_ids: user.chapter_admin_ids || [],
      isAuthenticated: true,
    })
  } catch (error) {
    console.error("Error getting user info:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
