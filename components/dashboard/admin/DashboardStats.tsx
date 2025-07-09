'use client'

import { useEffect, useState } from 'react'
import { User, Flag, Shield, Globe } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function DashboardStats() {
  const [stats, setStats] = useState<any | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats/overview')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized or error')
        return res.json()
      })
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  if (!stats) return null

  const visualStats = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: User,
      color: 'text-blue-500'
    },
    {
      title: 'Total Chapters',
      value: stats.chapters,
      icon: Flag,
      color: 'text-green-500'
    },
    {
      title: 'Admins',
      value: stats.admins,
      icon: Shield,
      color: 'text-yellow-500'
    },
    {
      title: 'Active Projects',
      value: stats.active_projects,
      icon: Globe,
      color: 'text-red-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {visualStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
