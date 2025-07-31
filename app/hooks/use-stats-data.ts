"use client"

import { useState, useEffect } from "react"
import { useDomainContext } from "./use-domain-context"

interface StatsData {
  totalPeople: number
  totalWomen: number
  totalMen: number
  otherGenders: number
  lastUpdated: string
  error?: string
}

interface GraphDataPoint {
  year: number
  month: number
  day?: number
  total: number
  totalWomen: number
  totalMen: number
  otherGenders: number
}

interface ApiGraphResponse {
  data: GraphDataPoint[]
  executionTime: number
}

export function useStatsData(startDate?: string, endDate?: string) {
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const domainContext = useDomainContext()

  useEffect(() => {
    const fetchData = async () => {
      if (!domainContext.currentProject && domainContext.needsProjectSelection) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const project = domainContext.currentProject || "wikidatawiki"

        // Construir URLs directamente a la API externa
        let statsUrl = `https://api.wikipeoplestats.org/v1/genders/stats/${project}`
        let graphUrl = `https://api.wikipeoplestats.org/v1/genders/graph/${project}`

        // Añadir fechas si están presentes
        if (startDate || endDate) {
          statsUrl += `/${startDate || ""}/${endDate || ""}`
          graphUrl += `/${startDate || ""}/${endDate || ""}`
        }

        console.log("Fetching stats from:", statsUrl)
        console.log("Fetching graph from:", graphUrl)

        const [statsResponse, graphResponse] = await Promise.all([
          fetch(statsUrl, {
            headers: {
              "User-Agent": "WikiPeopleStats/1.0",
            },
            cache: "no-cache", // Para asegurar datos frescos
          }),
          fetch(graphUrl, {
            headers: {
              "User-Agent": "WikiPeopleStats/1.0",
            },
            cache: "no-cache", // Para asegurar datos frescos
          }),
        ])

        if (statsResponse.ok) {
          const stats = await statsResponse.json()
          console.log("Stats data:", stats)
          setStatsData(stats)
        } else {
          console.error("Stats response not ok:", statsResponse.status)
          setStatsData({
            totalPeople: 0,
            totalWomen: 0,
            totalMen: 0,
            otherGenders: 0,
            lastUpdated: new Date().toISOString(),
          })
        }

        if (graphResponse.ok) {
          const graphResult: ApiGraphResponse = await graphResponse.json()
          console.log("Graph response:", graphResult)

          // Acceder correctamente a los datos
          const graphDataArray = graphResult.data || []

          // Filtrar datos vacíos del inicio
          const firstNonZeroIndex = graphDataArray.findIndex(
            (item: GraphDataPoint) =>
              item.total > 0 || item.totalWomen > 0 || item.totalMen > 0 || item.otherGenders > 0,
          )

          const filteredData = firstNonZeroIndex >= 0 ? graphDataArray.slice(firstNonZeroIndex) : graphDataArray

          console.log("Filtered graph data:", filteredData)
          setGraphData(filteredData)
        } else {
          console.error("Graph response not ok:", graphResponse.status)
          setGraphData([])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
        setStatsData({
          totalPeople: 0,
          totalWomen: 0,
          totalMen: 0,
          otherGenders: 0,
          lastUpdated: new Date().toISOString(),
        })
        setGraphData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [domainContext.currentProject, domainContext.needsProjectSelection, startDate, endDate])

  return { statsData, graphData, loading, error }
}
