"use client"

import { useState } from "react"
import {
  BarChart3,
  Users,
  Settings,
  Activity,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Plus,
  ChevronDown,
  Gavel,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ChapterAdminDashboardProps {
  user: {
    name: string
    email: string
    role: string
    chapter?: string
  }
}

export function ChapterAdminDashboard({ user }: ChapterAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const chapterName = user.chapter || "Wikimedia España"

  const stats = [
    {
      title: "Chapter Users",
      value: "234",
      change: "+12",
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Active Projects",
      value: "12",
      change: "+2",
      icon: Activity,
      color: "text-green-500"
    },
    {
      title: "Monthly Growth",
      value: "8.5%",
      change: "+1.2%",
      icon: TrendingUp,
      color: "text-purple-500"
    },
    {
      title: "Pending Reviews",
      value: "7",
      change: "-3",
      icon: FileText,
      color: "text-orange-500"
    }
  ]

  const recentActivities = [
    { action: "New user registered", project: "Spanish Wikipedia", time: "5 min", type: "success" },
    { action: "Content moderated", project: "Spanish Wikiquote", time: "20 min", type: "warning" },
    { action: "Project statistics updated", project: "Chapter Dashboard", time: "1h", type: "info" },
    { action: "New moderator assigned", project: "Spanish Wikisource", time: "2h", type: "success" },
    { action: "Monthly report generated", project: "Chapter Analytics", time: "4h", type: "info" },
  ]

  const chapterProjects = [
    { name: "Spanish Wikipedia", users: 156, status: "active", growth: "+5.2%" },
    { name: "Spanish Wikiquote", users: 43, status: "active", growth: "+2.1%" },
    { name: "Spanish Wikisource", users: 28, status: "active", growth: "+1.8%" },
    { name: "Spanish Wiktionary", users: 35, status: "active", growth: "+3.4%" },
  ]

  const moderationQueue = [
    { type: "content", title: "Article review needed", project: "Spanish Wikipedia", priority: "high" },
    { type: "user", title: "User behavior report", project: "Spanish Wikiquote", priority: "medium" },
    { type: "content", title: "Copyright concern", project: "Spanish Wikisource", priority: "high" },
    { type: "technical", title: "Template issue", project: "Spanish Wikipedia", priority: "low" },
  ]

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "projects", label: "Projects", icon: Activity },
    { id: "moderation", label: "Moderation", icon: Gavel },
    { id: "settings", label: "Settings", icon: Settings }
  ]



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
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
                  Chapter Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {chapterName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="default" className="hidden sm:inline-flex">
                Chapter Admin
              </Badge>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">
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
                          <AvatarFallback className="bg-orange-500 text-white font-medium">
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
                          <Badge variant="default" className="mt-1">
                            Chapter Admin
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <div className="flex space-x-4 sm:space-x-6 lg:space-x-8 px-2 sm:px-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-2 sm:px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
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

            {/* Recent Activity & Moderation Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest activities in your chapter</CardDescription>
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
                  <CardTitle>Moderation Queue</CardTitle>
                  <CardDescription>Items requiring your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moderationQueue.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.project}
                          </p>
                        </div>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chapter Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Chapter Projects</CardTitle>
                <CardDescription>Overview of projects in your chapter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chapterProjects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project.users} users
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="w-3 h-3 bg-green-500 rounded-full mb-1" />
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {project.growth}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "overview" && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Chapter Admin {tabs.find(tab => tab.id === activeTab)?.label} content coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
