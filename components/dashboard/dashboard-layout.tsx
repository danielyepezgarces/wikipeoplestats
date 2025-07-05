"use client"

import { DashboardContent } from "./dashboard-content"

interface DashboardLayoutProps {
  user: {
    name: string
    email: string
    role: string
    chapter?: string
  }
  onClose: () => void
}

export function DashboardLayout({ user, onClose }: DashboardLayoutProps) {
  // This component is now deprecated in favor of the full-page dashboard
  // Redirect to the new dashboard page
  if (typeof window !== 'undefined') {
    window.location.href = '/dashboard'
  }
  
  return null
}