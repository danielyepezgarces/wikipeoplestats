// app/api/admin/users/[userId]/roles/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, checkPermission } from "@/lib/auth-middleware"
import { RoleManager } from "@/lib/role-manager"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
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

    const { userId } = await params
    const targetUserId = Number.parseInt(userId)

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400, headers: response.headers })
    }

    // Verificar autenticación
    const { userId: currentUserId } = await requireAuth(request)

    // Solo super admins y chapter admins pueden ver roles de otros usuarios
    // Los usuarios pueden ver sus propios roles
    if (currentUserId !== targetUserId) {
      const { hasPermission } = await checkPermission(request, "manage_users")
      if (!hasPermission) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403, headers: response.headers })
      }
    }

    // Obtener roles del usuario
    const roles = await RoleManager.getUserRoles(targetUserId)

    return NextResponse.json(
      {
        userId: targetUserId,
        roles: roles,
      },
      {
        status: 200,
        headers: response.headers,
      },
    )
  } catch (error) {
    console.error("Error fetching user roles:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("permissions") || error.message.includes("Authentication") ? 403 : 500 },
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
