import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  icon: React.ReactNode
  title: string
  value: number
  percentage?: number
  iconColor: string
}

export function StatsCard({ icon, title, value, percentage, iconColor }: StatsCardProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString().replace(/,/g, " ")
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-6 flex flex-col items-center">
        <div className={`text-3xl ${iconColor} mb-4`}>{icon}</div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">{title}</h3>
          <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{formatNumber(value)}</p>
          {percentage !== undefined && <p className="mt-2 text-gray-500 dark:text-gray-400">{percentage.toFixed(2)}%</p>}
        </div>
      </CardContent>
    </Card>
  )
}