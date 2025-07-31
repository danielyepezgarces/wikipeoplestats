import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ project: string }> }) {
  try {
    const { project } = await params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    // Construir la URL de la API
    let url = `https://api.wikipeoplestats.org/v1/genders/graph/${project}`

    // Añadir fechas si están presentes
    if (startDate || endDate) {
      url += `/${startDate || ""}/${endDate || ""}`
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "WikiPeopleStats/1.0",
      },
      next: { revalidate: 3600 }, // Cache por 1 hora
    })

    if (!response.ok) {
      throw new Error("Failed to fetch graph data")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching graph data:", error)
    return NextResponse.json({ error: "Failed to fetch graph data", data: [] }, { status: 500 })
  }
}
