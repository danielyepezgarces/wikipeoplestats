'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { SuperAdminDashboard } from '@/components/dashboard/super-admin-dashboard'
import { ChapterAdminDashboard } from '@/components/dashboard/chapter-admin-dashboard'
import { ModeratorDashboard } from '@/components/dashboard/moderator-dashboard'
import { DefaultDashboard } from '@/components/dashboard/default-dashboard'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!user) return null

  // Renderizar dashboard según el rol
  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboard user={user} />
    case 'chapter_admin':
    case 'community_admin':
      return <ChapterAdminDashboard user={user} />
    case 'chapter_moderator':
    case 'community_moderator':
      return <ModeratorDashboard user={user} />
    case 'chapter_partner':
    case 'chapter_staff':
    case 'chapter_affiliate':
    case 'community_partner':
    default:
      return <DefaultDashboard user={user} />
  }
}