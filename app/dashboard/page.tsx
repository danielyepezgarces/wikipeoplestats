'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { useAuth } from '@/hooks/use-auth'



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

  return (
    <DashboardContent
      user={{
        name: user.username,
        email: user.email || '',
        role: user.role
      }}
    />
  )
}
