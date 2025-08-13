import type { EventStats as EventStatsType } from "@/types/events"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, User, Sparkles, Edit } from "lucide-react"

interface EventStatsProps {
  stats: EventStatsType
}

export default function EventStats({ stats }: EventStatsProps) {
  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(2) : "0.00"
  }

  const statsCards = [
    {
      title: "Total de Personas",
      value: stats.totalPeople,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Mujeres",
      value: stats.totalWomen,
      percentage: calculatePercentage(stats.totalWomen, stats.totalPeople),
      icon: UserCheck,
      color: "text-pink-500",
    },
    {
      title: "Hombres",
      value: stats.totalMen,
      percentage: calculatePercentage(stats.totalMen, stats.totalPeople),
      icon: User,
      color: "text-blue-700",
    },
    {
      title: "Otros Géneros",
      value: stats.otherGenders,
      percentage: calculatePercentage(stats.otherGenders, stats.totalPeople),
      icon: Sparkles,
      color: "text-purple-500",
    },
    {
      title: "Total de Editores",
      value: stats.totalContributions,
      icon: Edit,
      color: "text-green-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon

        return (
          <Card key={index} className="text-center">
            <CardHeader className="pb-2">
              <IconComponent className={`mx-auto h-8 w-8 ${stat.color}`} />
              <CardTitle className="text-lg font-bold whitespace-nowrap">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stat.value.toLocaleString()}</p>
              {stat.percentage && <p className="mt-2 text-muted-foreground">{stat.percentage}%</p>}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
