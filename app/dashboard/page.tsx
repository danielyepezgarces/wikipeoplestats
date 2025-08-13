"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { SuperAdminDashboard } from "@/components/dashboard/super-admin-dashboard"
import { ChapterAdminDashboard } from "@/components/dashboard/chapter-admin-dashboard"
import { ModeratorDashboard } from "@/components/dashboard/moderator-dashboard"
import { DefaultDashboard } from "@/components/dashboard/default-dashboard"
import { DashboardSwitcher } from "@/components/dashboard/dashboard-switcher"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, getDashboardUrl } = useAuth()
  const router = useRouter()
  const [selectedDashboard, setSelectedDashboard] = useState<string>("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user && !selectedDashboard) {
      const defaultDashboard = getDashboardUrl()
      setSelectedDashboard(defaultDashboard.replace("/dashboard/", "") || "default")
    }
  }, [user, selectedDashboard, getDashboardUrl])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!user) return null

  const availableDashboards = []
  if (user.roles.some((r) => r.role === "super_admin")) {
    availableDashboards.push({ key: "super-admin", label: "Super Admin", role: "super_admin" })
  }
  if (user.roles.some((r) => r.role === "chapter_admin")) {
    availableDashboards.push({ key: "chapter-admin", label: "Chapter Admin", role: "chapter_admin" })
  }
  if (user.roles.some((r) => r.role === "chapter_moderator")) {
    availableDashboards.push({ key: "moderator", label: "Moderator", role: "chapter_moderator" })
  }
  if (user.roles.some((r) => ["chapter_partner", "chapter_staff", "chapter_affiliate"].includes(r.role))) {
    availableDashboards.push({ key: "default", label: "My Dashboard", role: "default" })
  }

  const showSwitcher = availableDashboards.length > 1

  const renderDashboard = () => {
    switch (selectedDashboard) {
      case "super-admin":
        return <SuperAdminDashboard user={user} />
      case "chapter-admin":
        return <ChapterAdminDashboard user={user} />
      case "moderator":
        return <ModeratorDashboard user={user} />
      default:
        return <DefaultDashboard user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C]">
      {showSwitcher && (
        <DashboardSwitcher
          availableDashboards={availableDashboards}
          selectedDashboard={selectedDashboard}
          onDashboardChange={setSelectedDashboard}
        />
      )}
      {renderDashboard()}
    </div>
  )
}