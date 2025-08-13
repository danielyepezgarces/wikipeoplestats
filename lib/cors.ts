import { type NextRequest, NextResponse } from "next/server"

export function setCorsHeaders(response: NextResponse, origin?: string | null) {
  const isAllowedOrigin = (origin: string): boolean => {
    // Development origins
    if (process.env.NODE_ENV === "development") {
      const devOrigins = [
        "http://localhost:3030",
        "http://127.0.0.1:3030",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ]
      if (devOrigins.includes(origin)) return true
    }

    // Production: allow any subdomain of wikipeoplestats.org
    const wikipeoplestatsRegex = /^https:\/\/([a-zA-Z0-9-]+\.)?wikipeoplestats\.org$/
    return wikipeoplestatsRegex.test(origin)
  }

  if (origin && isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  }

  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")

  return response
}

export async function handleCorsOptions(request: NextRequest) {
  const origin = request.headers.get("origin")
  const response = new NextResponse(null, { status: 200 })
  return setCorsHeaders(response, origin)
}
