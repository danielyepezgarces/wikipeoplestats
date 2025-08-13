import { type NextRequest, NextResponse } from "next/server"
import { checkPermission } from "@/lib/auth-middleware"

export async function POST(request: NextRequest) {
  try {
    const { permission, chapter_id } = await request.json()

    if (!permission) {
      return NextResponse.json({ error: "Permission parameter is required" }, { status: 400 })
    }

    const { auth, hasPermission } = await checkPermission(request, permission, chapter_id)

    return NextResponse.json({
      user_id: auth.user.id,
      username: auth.user.username,
      permission,
      chapter_id,
      has_permission: hasPermission,
    })
  } catch (error) {
    console.error("Permission check error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication required" },
      { status: 401 },
    )
  }
}
