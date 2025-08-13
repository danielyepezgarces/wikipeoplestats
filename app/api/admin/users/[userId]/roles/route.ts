// app/api/admin/users/[userId]/roles/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { requireAnyRole } from "@/lib/auth-middleware"
import { RoleManager } from "@/lib/role-manager"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await requireAnyRole(request, ["super_admin", "admin"])

    const userId = Number.parseInt(params.userId)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Obtener roles del usuario
    const roles = await RoleManager.getUserRoles(userId)

    return NextResponse.json({
      user_id: userId,
      roles: roles,
    })
  } catch (error) {
    console.error("Error getting user roles:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication required" },
      { status: 401 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await requireAnyRole(request, ["super_admin", "admin"])

    const userId = Number.parseInt(params.userId)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const { role, chapter_id } = await request.json()

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 })
    }

    // Asignar roles al usuario
    await RoleManager.assignUserRole(userId, role, chapter_id)

    return NextResponse.json({
      message: "Role assigned successfully",
      user_id: userId,
      role,
      chapter_id,
    })
  } catch (error) {
    console.error("Error assigning role:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication required" },
      { status: 401 },
    )
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
