"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp } from "lucide-react"
import { useI18n } from "@/hooks/use-i18n"

interface GraphDataPoint {
  year: number
  month: number
  day?: number
  total: number
  totalWomen: number
  totalMen: number
  otherGenders: number
}

interface HighchartsWrapperProps {
  data: GraphDataPoint[]
  currentLang: string
  projectName: string
}

export function HighchartsWrapper({ data, currentLang, projectName }: HighchartsWrapperProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<any>(null)
  const [isCumulative, setIsCumulative] = useState(false)
  const [Highcharts, setHighcharts] = useState<any>(null)
  const { t } = useI18n(currentLang)

  // Load Highcharts dynamically
  useEffect(() => {
    const loadHighcharts = async () => {
      try {
        const HighchartsModule = await import("highcharts")
        const HighchartsExporting = await import("highcharts/modules/exporting")
        const HighchartsOfflineExporting = await import("highcharts/modules/offline-exporting")

        HighchartsExporting.default(HighchartsModule.default)
        HighchartsOfflineExporting.default(HighchartsModule.default)

        setHighcharts(HighchartsModule.default)
      } catch (error) {
        console.error("Error loading Highcharts:", error)
      }
    }

    loadHighcharts()
  }, [])

  const calculateCumulative = (data: GraphDataPoint[], key: keyof GraphDataPoint): number[] => {
    let cumulativeSum = 0
    return data.map((item) => {
      cumulativeSum += Number(item[key])
      return cumulativeSum
    })
  }

  const formatDate = (item: GraphDataPoint): string => {
    // Si tiene día, mostrar fecha completa
    if (item.day) {
      return `${item.year}-${String(item.month).padStart(2, "0")}-${String(item.day).padStart(2, "0")}`
    }
    // Si no tiene día, mostrar solo año-mes
    return `${item.year}-${String(item.month).padStart(2, "0")}`
  }

  const createChart = () => {
    if (!Highcharts || !chartRef.current || data.length === 0) {
      console.log("Cannot create chart:", {
        hasHighcharts: !!Highcharts,
        hasRef: !!chartRef.current,
        dataLength: data.length,
      })
      return
    }

    console.log("Creating chart with data:", data)

    const categories = data.map(formatDate)
    const isDarkMode = document.documentElement.classList.contains("dark")

    const chartOptions = {
      chart: {
        type: "line",
        backgroundColor: "transparent",
        style: {
          fontFamily: "Inter, sans-serif",
        },
        height: 400,
      },
      title: {
        text: `${t("gender_statistics")} - ${projectName}`,
        style: {
          color: isDarkMode ? "#ffffff" : "#1f2937",
          fontSize: "18px",
          fontWeight: "600",
        },
      },
      subtitle: {
        text: isCumulative ? t("cumulative_view") : t("normal_view"),
        style: {
          color: isDarkMode ? "#d1d5db" : "#6b7280",
        },
      },
      xAxis: {
        categories,
        title: {
          text: t("timeline_graph"),
          style: {
            color: isDarkMode ? "#d1d5db" : "#374151",
          },
        },
        labels: {
          style: {
            color: isDarkMode ? "#d1d5db" : "#374151",
          },
          rotation: data.length > 20 ? -45 : 0, // Rotar etiquetas si hay muchos datos
        },
        gridLineColor: isDarkMode ? "#374151" : "#e5e7eb",
      },
      yAxis: {
        title: {
          text: t("quantity_graph"),
          style: {
            color: isDarkMode ? "#d1d5db" : "#374151",
          },
        },
        labels: {
          style: {
            color: isDarkMode ? "#d1d5db" : "#374151",
          },
        },
        gridLineColor: isDarkMode ? "#374151" : "#e5e7eb",
        min: 0,
      },
      tooltip: {
        shared: true,
        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
        borderColor: isDarkMode ? "#374151" : "#d1d5db",
        style: {
          color: isDarkMode ? "#ffffff" : "#1f2937",
        },
        formatter: function (this: any) {
          let tooltip = `<b>${this.x}</b><br/>`
          this.points.forEach((point: any) => {
            tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y.toLocaleString()}</b><br/>`
          })
          return tooltip
        },
      },
      legend: {
        itemStyle: {
          color: isDarkMode ? "#d1d5db" : "#374151",
        },
        itemHoverStyle: {
          color: isDarkMode ? "#ffffff" : "#1f2937",
        },
      },
      plotOptions: {
        line: {
          marker: {
            enabled: data.length <= 50, // Solo mostrar marcadores si hay pocos datos
            radius: 3,
            states: {
              hover: {
                enabled: true,
                radius: 5,
              },
            },
          },
          lineWidth: 2,
          states: {
            hover: {
              lineWidth: 3,
            },
          },
        },
      },
      series: [
        {
          name: t("total_people"),
          data: isCumulative ? calculateCumulative(data, "total") : data.map((item) => item.total),
          color: "#3b82f6",
        },
        {
          name: t("total_women"),
          data: isCumulative ? calculateCumulative(data, "totalWomen") : data.map((item) => item.totalWomen),
          color: "#ec4899",
        },
        {
          name: t("total_men"),
          data: isCumulative ? calculateCumulative(data, "totalMen") : data.map((item) => item.totalMen),
          color: "#1d4ed8",
        },
        {
          name: t("other_genders"),
          data: isCumulative ? calculateCumulative(data, "otherGenders") : data.map((item) => item.otherGenders),
          color: "#8b5cf6",
        },
      ],
      credits: {
        enabled: false,
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: [
              "viewFullscreen",
              "separator",
              {
                text: t("download_png"),
                onclick: function (this: any) {
                  downloadChartWithWatermark(this, "png")
                },
              },
              {
                text: t("download_svg"),
                onclick: function (this: any) {
                  downloadChartWithWatermark(this, "svg")
                },
              },
              {
                text: t("download_pdf"),
                onclick: function (this: any) {
                  downloadChartWithWatermark(this, "pdf")
                },
              },
            ],
          },
        },
      },
    }

    // Destruir gráfico anterior si existe
    if (chart) {
      chart.destroy()
    }

    const newChart = Highcharts.chart(chartRef.current, chartOptions)
    setChart(newChart)
  }

  const downloadChartWithWatermark = (chart: any, format: string) => {
    const originalCredits = chart.options.credits

    // Add watermark
    chart.update({
      credits: {
        enabled: true,
        text: "WikiPeopleStats.org",
        href: "https://www.wikipeoplestats.org",
        style: {
          color: "#6b7280",
          fontSize: "12px",
        },
        position: {
          align: "right",
          x: -10,
          y: -5,
        },
      },
    })

    // Export with watermark
    chart.exportChart(
      {
        type: `image/${format}`,
        filename: `wikipeoplestats-${projectName}-${new Date().toISOString().split("T")[0]}`,
      },
      {
        chart: {
          backgroundColor: "#ffffff",
        },
      },
    )

    // Restore original credits
    setTimeout(() => {
      chart.update({
        credits: originalCredits,
      })
    }, 100)
  }

  useEffect(() => {
    if (Highcharts && data.length > 0) {
      console.log("Creating chart with Highcharts and data:", data.length, "points")
      createChart()
    }

    return () => {
      if (chart) {
        chart.destroy()
      }
    }
  }, [Highcharts, data, isCumulative, currentLang])

  const toggleCumulative = () => {
    setIsCumulative(!isCumulative)
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t("no_chart_data")}</h3>
        <p className="text-gray-500 dark:text-gray-400">{t("no_chart_data_description")}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("statistics_chart")}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={toggleCumulative} className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>{isCumulative ? t("show_normal") : t("show_cumulative")}</span>
          </Button>
        </div>
      </div>
      <div ref={chartRef} className="w-full h-96" />
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        {data.length} {t("data_points")} • {data[0]?.day ? t("daily_data") : t("monthly_data")}
      </div>
    </div>
  )
}
