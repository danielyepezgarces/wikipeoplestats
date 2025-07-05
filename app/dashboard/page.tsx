"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <DashboardContent user={user} />
}