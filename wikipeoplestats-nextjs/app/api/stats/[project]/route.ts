import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ project: string }> }) {
  try {
    const { project } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    // Mantener el endpoint original
    const url = `https://api.wikipeoplestats.org/v1/stats/${project}${action ? `?action=${action}` : ""}`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "WikiPeopleStats/1.0",
      },
      next: { revalidate: 3600 }, // Cache por 1 hora
    })

    if (!response.ok) {
      throw new Error("Failed to fetch stats")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ project: string }> }) {
  try {
    const { project } = await params

    // Purge cache endpoint
    const url = `https://api.wikipeoplestats.org/v1/genders/stats/${project}?action=purge`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "WikiStatsPeople/1.0",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to purge cache")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error purging cache:", error)
    return NextResponse.json({ error: "Failed to purge cache" }, { status: 500 })
  }
}
