// app/dashboard/superadmin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { SuperAdminHeader } from '@/components/dashboard/layout/SuperAdminHeader'
import { ChaptersSection } from '@/components/dashboard/admin/ChaptersSection'
import { UsersSection } from '@/components/dashboard/admin/UsersSection'
import { DashboardStats } from '@/components/dashboard/admin/DashboardStats'
import { BarChart3, Globe, Users, Settings, Shield } from 'lucide-react'

export default function SuperAdminDashboardPage({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const savedTab = localStorage.getItem('adminTab')
    if (savedTab) setActiveTab(savedTab)
  }, [])

  useEffect(() => {
    localStorage.setItem('adminTab', activeTab)
  }, [activeTab])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'chapters', label: 'Chapters', icon: Globe },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SuperAdminHeader user={user} currentLang="en" />

      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="hidden lg:flex space-x-8 mt-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && <DashboardStats />}
        {activeTab === 'chapters' && <ChaptersSection />}
        {activeTab === 'users' && <UsersSection />}
      </div>
    </div>
  )
}
