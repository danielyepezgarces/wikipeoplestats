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

        // Fetch stats data
        let statsUrl = `/api/stats/${project}`
        if (startDate || endDate) {
          statsUrl += `?start_date=${startDate || ""}&end_date=${endDate || ""}`
        }

        const [statsResponse, graphResponse] = await Promise.all([
          fetch(statsUrl),
          fetch(`/api/graph/${project}?start_date=${startDate || ""}&end_date=${endDate || ""}`),
        ])

        if (statsResponse.ok) {
          const stats = await statsResponse.json()
          setStatsData(stats)
        }

        if (graphResponse.ok) {
          const graph = await graphResponse.json()
          // Filter out zero data points from the beginning
          const firstNonZeroIndex = graph.data?.findIndex(
            (item: GraphDataPoint) =>
              item.total > 0 || item.totalWomen > 0 || item.totalMen > 0 || item.otherGenders > 0,
          )
          const filteredData = graph.data?.slice(firstNonZeroIndex >= 0 ? firstNonZeroIndex : 0) || []
          setGraphData(filteredData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [domainContext.currentProject, domainContext.needsProjectSelection, startDate, endDate])

  return { statsData, graphData, loading, error }
}
