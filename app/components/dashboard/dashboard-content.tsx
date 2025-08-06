"use client"

import { useAuth } from '@/hooks/use-auth'
import { SuperAdminDashboard } from '@/components/dashboard/super-admin-dashboard'
import { ChapterAdminDashboard } from '@/components/dashboard/chapter-admin-dashboard'
import { ModeratorDashboard } from '@/components/dashboard/moderator-dashboard'
import { DefaultDashboard } from '@/components/dashboard/default-dashboard'
import { ContextSwitcher } from '@/components/dashboard/context-switcher'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

export function DashboardContent() {
  const { user, activeContext, getAvailableContexts, isLoading } = useAuth()
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please log in to access the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No active context (shouldn't happen but safety check)
  if (!activeContext) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Initializing dashboard context...</p>
            <p className="text-sm text-gray-500 mt-2">
              User: {user.name} | Roles: {user.roles.join(', ')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const availableContexts = getAvailableContexts()
  const currentRole = activeContext.role
  
  // Preparar datos del usuario para el dashboard
  const dashboardUser = {
    id: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
    name: user.name,
    email: user.email ?? '',
    role: currentRole,
    chapter: activeContext.chapterName
  }
  
  // Mostrar switcher si hay múltiples contextos
  const showSwitcher = availableContexts.length > 1
  
  // Renderizar dashboard basado en el rol activo
  const renderDashboard = () => {
    console.log('Rendering dashboard for role:', currentRole, 'Context:', activeContext)
    
    switch (currentRole) {
      case 'super_admin':
        return <SuperAdminDashboard user={dashboardUser} />
      case 'chapter_admin':
      case 'community_admin':
        return <ChapterAdminDashboard user={dashboardUser} />
      case 'chapter_moderator':
      case 'community_moderator':
        return <ModeratorDashboard user={dashboardUser} />
      case 'chapter_partner':
      case 'chapter_staff':
      case 'chapter_affiliate':
      case 'community_partner':
      default:
        return <DefaultDashboard user={dashboardUser} />
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showSwitcher && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ContextSwitcher />
                <div className="hidden sm:block text-sm text-muted-foreground">
                  {availableContexts.length} role{availableContexts.length !== 1 ? 's' : ''} available
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Active: {activeContext.chapterName || 'Global'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {renderDashboard()}
    </div>
  )
}