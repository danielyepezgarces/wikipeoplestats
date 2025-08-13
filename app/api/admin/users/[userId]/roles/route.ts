import { type NextRequest, NextResponse } from "next/server"
import { checkPermission } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const headers = {
    "Access-Control-Allow-Origin": "https://www.wikipeoplestats.org",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
  }

  try {
    const { user, hasPermission } = await checkPermission(request, "admin")

    if (!user || !hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403, headers })
    }

    const userId = Number.parseInt(params.userId)

    // Here you would get user roles from database
    // For now, return empty array
    const roles: any[] = []

    return NextResponse.json({ roles }, { headers })
  } catch (error) {
    console.error("Get user roles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers })
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  const headers = {
    "Access-Control-Allow-Origin": "https://www.wikipeoplestats.org",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
  }

  try {
    const { user, hasPermission } = await checkPermission(request, "admin")

    if (!user || !hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403, headers })
    }

    const userId = Number.parseInt(params.userId)
    const body = await request.json()
    const { role, chapterId } = body

    // Here you would assign role to user in database
    // For now, return success

    return NextResponse.json({ message: "Role assigned successfully" }, { headers })
  } catch (error) {
    console.error("Assign role error:", error)
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
