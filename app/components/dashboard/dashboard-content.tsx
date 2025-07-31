"use client"

import { SuperAdminDashboard } from '@/components/dashboard/super-admin-dashboard'
import { ChapterAdminDashboard } from '@/components/dashboard/chapter-admin-dashboard'
import { ModeratorDashboard } from '@/components/dashboard/moderator-dashboard'
import { DefaultDashboard } from '@/components/dashboard/default-dashboard'

interface DashboardContentProps {
  user: {
    name: string
    email: string
    role: string
    chapter?: string
  }
}

function DashboardContent({ user }: DashboardContentProps) {
  // Render the appropriate dashboard based on user role
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

export { DashboardContent }
