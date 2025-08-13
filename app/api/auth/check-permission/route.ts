// app/api/auth/check-permission/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { checkPermission } from "@/lib/auth-middleware"

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

    const { searchParams } = new URL(request.url)
    const permission = searchParams.get("permission")
    const chapterIdParam = searchParams.get("chapterId")

    if (!permission) {
      return NextResponse.json(
        { error: "Permission parameter is required" },
        { status: 400, headers: response.headers },
      )
    }

    const chapterId = chapterIdParam ? Number.parseInt(chapterIdParam) : undefined

    // Verificar el permiso
    const { auth, hasPermission } = await checkPermission(request, permission as any, chapterId)

    return NextResponse.json(
      {
        userId: auth.userId,
        permission,
        chapterId,
        hasPermission,
      },
      {
        status: 200,
        headers: response.headers,
      },
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("Authentication") ? 401 : 500 },
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
