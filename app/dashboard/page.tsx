'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Solo redirigir si ya terminó de cargar y no está autenticado
    if (!isLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si no está autenticado, mostrar mensaje mientras redirige
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Debug info
  console.log('Dashboard Page - User:', user, 'Authenticated:', isAuthenticated)

  return <DashboardContent />
}