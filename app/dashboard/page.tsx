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
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [selectedDashboard, setSelectedDashboard] = useState<string>("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user && user.roles && user.roles.length > 0 && !selectedDashboard) {
      const roles = user.roles
      if (roles.some((r) => r.role === "super_admin")) {
        setSelectedDashboard("super_admin")
      } else if (roles.some((r) => r.role === "chapter_admin")) {
        setSelectedDashboard("chapter_admin")
      } else if (roles.some((r) => r.role === "chapter_moderator")) {
        setSelectedDashboard("chapter_moderator")
      } else {
        setSelectedDashboard("default")
      }
    }
  }, [user, selectedDashboard])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!user || !user.roles) return null

  const availableDashboards = []

  // Super Admin
  const superAdminRoles = user.roles.filter((r) => r.role === "super_admin")
  superAdminRoles.forEach((role) => {
    availableDashboards.push({
      key: "super_admin",
      label: "Super Admin",
      role: "super_admin",
      chapter: role.chapter_name || "Global",
      chapterId: role.chapter_id,
    })
  })

  // Chapter Admin
  const chapterAdminRoles = user.roles.filter((r) => r.role === "chapter_admin")
  chapterAdminRoles.forEach((role) => {
    availableDashboards.push({
      key: `chapter_admin_${role.chapter_id}`,
      label: "Chapter Admin",
      role: "chapter_admin",
      chapter: role.chapter_name || `Chapter ${role.chapter_id}`,
      chapterId: role.chapter_id,
    })
  })

  // Chapter Moderator
  const moderatorRoles = user.roles.filter((r) => r.role === "chapter_moderator")
  moderatorRoles.forEach((role) => {
    availableDashboards.push({
      key: `chapter_moderator_${role.chapter_id}`,
      label: "Moderator",
      role: "chapter_moderator",
      chapter: role.chapter_name || `Chapter ${role.chapter_id}`,
      chapterId: role.chapter_id,
    })
  })

  // Other roles (partner, staff, affiliate)
  const otherRoles = user.roles.filter((r) =>
    ["chapter_partner", "chapter_staff", "chapter_affiliate"].includes(r.role),
  )
  if (otherRoles.length > 0) {
    availableDashboards.push({
      key: "default",
      label: "My Dashboard",
      role: "default",
      chapter: "Personal",
      chapterId: null,
    })
  }

  const showSwitcher = availableDashboards.length > 1

  const renderDashboard = () => {
    const selectedRole = availableDashboards.find((d) => d.key === selectedDashboard)

    if (selectedDashboard === "super_admin") {
      return <SuperAdminDashboard user={user} />
    } else if (selectedDashboard.startsWith("chapter_admin")) {
      return <ChapterAdminDashboard user={user} selectedChapter={selectedRole?.chapterId} />
    } else if (selectedDashboard.startsWith("chapter_moderator")) {
      return <ModeratorDashboard user={user} selectedChapter={selectedRole?.chapterId} />
    } else {
      return <DefaultDashboard user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C]">
      {showSwitcher && (
        <DashboardSwitcher
          user={user}
          availableDashboards={availableDashboards}
          selectedDashboard={selectedDashboard}
          onDashboardChange={setSelectedDashboard}
        />
      )}
      {renderDashboard()}
    </div>
  )
}
