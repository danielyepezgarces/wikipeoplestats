"use client"

import { useState } from "react"
import { 
  BarChart3, 
  Users, 
  Settings, 
  Database, 
  Activity, 
  Globe, 
  TrendingUp,
  Shield,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Trash2,
  Plus,
  Menu,
  X,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChaptersSection } from "@/components/dashboard/admin/ChaptersSection"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SuperAdminDashboardProps {
  user: {
    name: string
    email: string
    role: string
    chapter?: string
  }
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const stats = [
    {
      title: "Total Chapters",
      value: "47",
      change: "+3",
      icon: Globe,
      color: "text-blue-500"
    },
    {
      title: "Global Users",
      value: "2,341",
      change: "+127",
      icon: Users,
      color: "text-green-500"
    },
    {
      title: "Active Projects",
      value: "847",
      change: "+12",
      icon: Database,
      color: "text-purple-500"
    },
    {
      title: "System Health",
      value: "99.9%",
      change: "+0.1%",
      icon: Activity,
      color: "text-orange-500"
    }
  ]

  const recentActivities = [
    { action: "New chapter registered", project: "Wikimedia Colombia", time: "2 min", type: "success" },
    { action: "System maintenance completed", project: "Global Infrastructure", time: "15 min", type: "info" },
    { action: "Security alert resolved", project: "Authentication System", time: "1h", type: "warning" },
    { action: "Database backup completed", project: "Data Management", time: "2h", type: "success" },
    { action: "API rate limit adjusted", project: "Global API", time: "3h", type: "info" },
  ]

  const chapters = [
    { name: "Wikimedia España", projects: 12, users: 234, status: "active", moderators: 5, health: "excellent" },
    { name: "Wikimedia México", projects: 8, users: 156, status: "active", moderators: 3, health: "good" },
    { name: "Wikimedia Argentina", projects: 15, users: 289, status: "active", moderators: 7, health: "excellent" },
    { name: "Wikimedia Colombia", projects: 6, users: 98, status: "pending", moderators: 2, health: "fair" },
    { name: "Wikimedia Chile", projects: 10, users: 167, status: "active", moderators: 4, health: "good" },
  ]

  const systemAlerts = [
    { type: "warning", message: "High API usage detected in ES chapter", time: "5 min ago" },
    { type: "info", message: "Scheduled maintenance in 2 hours", time: "1 hour ago" },
    { type: "success", message: "All systems operational", time: "2 hours ago" },
  ]

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "chapters", label: "Chapters", icon: Globe },
    { id: "users", label: "Global Users", icon: Users },
    { id: "system", label: "System", icon: Settings },
    { id: "security", label: "Security", icon: Shield }
  ]

  const generateAvatarFromEmail = (email: string) => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-500'
      case 'good':
        return 'bg-blue-500'
      case 'fair':
        return 'bg-yellow-500'
      case 'poor':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleLogout = () => {
    console.log("Cerrando sesión...")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Global System Management
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="destructive" className="hidden sm:inline-flex">
                Super Admin
              </Badge>
              
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-red-500 text-white text-sm font-medium">
                      {generateAvatarFromEmail(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-red-500 text-white font-medium">
                            {generateAvatarFromEmail(user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                          <Badge variant="destructive" className="mt-1">
                            Super Admin
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        Cerrar Sesión
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {stat.change} this month
                        </p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Recent system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border">
                      {getActivityIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {alert.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {activity.project} • {activity.time} ago
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-20 flex-col">
                      <Plus className="h-5 w-5 mb-2" />
                      <span className="text-xs">New Chapter</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Users className="h-5 w-5 mb-2" />
                      <span className="text-xs">Manage Users</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Settings className="h-5 w-5 mb-2" />
                      <span className="text-xs">System Config</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Shield className="h-5 w-5 mb-2" />
                      <span className="text-xs">Security</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "chapters" && (
        <ChaptersSection chapters={chapters} />
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "overview" && activeTab !== "chapters" && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Super Admin {tabs.find(tab => tab.id === activeTab)?.label} content coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}