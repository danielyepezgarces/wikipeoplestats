import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { permission, chapterId } = await request.json()

    const user = await AuthService.getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ hasPermission: false }, { status: 401 })
    }

    let hasPermission = false

    switch (permission) {
      case "super_admin":
        hasPermission = user.roles?.includes("super_admin") || false
        break
      case "chapter_admin":
        hasPermission =
          user.roles?.includes("super_admin") ||
          (user.roles?.includes("chapter_admin") && (!chapterId || user.chapter_admin_ids?.includes(chapterId))) ||
          false
        break
      case "moderator":
        hasPermission =
          user.roles?.includes("super_admin") ||
          user.roles?.includes("moderator") ||
          user.roles?.includes("chapter_admin") ||
          false
        break
      default:
        hasPermission = user.roles?.includes(permission) || false
    }

    return NextResponse.json({ hasPermission })
  } catch (error) {
    console.error("Error checking permission:", error)
    return NextResponse.json({ hasPermission: false }, { status: 500 })
  }
}
