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
      <CardContent className="relative p-6 text-center overflow-hidden">
        {/* Decorative icon above the content */}
        <div className="flex justify-center mb-1">
          <span className={`text-[48px] opacity-30 ${iconColor}`}>{icon}</span>
        </div>

        {/* Main content */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">{title}</h3>
          <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{formatNumber(value)}</p>
          {percentage !== undefined && (
            <p className="mt-2 text-gray-500 dark:text-gray-400">{percentage.toFixed(2)}%</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
