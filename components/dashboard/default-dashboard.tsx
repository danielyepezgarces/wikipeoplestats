"use client"

import { useState } from "react"
import { 
  BarChart3, 
  Activity, 
  Eye,
  ChevronDown,
  FileText,
  TrendingUp,
  Users,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DefaultDashboardProps {
  user: {
    name: string
    email: string
    role: string
    chapter?: string
  }
}

export function DefaultDashboard({ user }: DefaultDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const chapterName = user.chapter || "Wikimedia Community"

  const stats = [
    {
      title: "Your Contributions",
      value: "47",
      change: "+5",
      icon: FileText,
      color: "text-blue-500"
    },
    {
      title: "Projects Accessed",
      value: "8",
      change: "+2",
      icon: BookOpen,
      color: "text-green-500"
    },
    {
      title: "Community Rank",
      value: "#234",
      change: "+12",
      icon: TrendingUp,
      color: "text-purple-500"
    },
    {
      title: "Active Days",
      value: "15",
      change: "+3",
      icon: Activity,
      color: "text-orange-500"
    }
  ]

  const recentActivities = [
    { action: "Viewed statistics", project: "Spanish Wikipedia", time: "5 min", type: "view" },
    { action: "Downloaded report", project: "Chapter Analytics", time: "20 min", type: "download" },
    { action: "Accessed dashboard", project: "Community Portal", time: "1h", type: "access" },
    { action: "Viewed user stats", project: "Spanish Wikiquote", time: "2h", type: "view" },
  ]

  const availableResources = [
    { 
      title: "Statistics Portal", 
      description: "View detailed statistics about Wikimedia projects",
      icon: BarChart3,
      action: "View Stats"
    },
    { 
      title: "Community Guidelines", 
      description: "Learn about community policies and best practices",
      icon: BookOpen,
      action: "Read More"
    },
    { 
      title: "Help Center", 
      description: "Get help and support for using the platform",
      icon: FileText,
      action: "Get Help"
    },
    { 
      title: "User Directory", 
      description: "Connect with other community members",
      icon: Users,
      action: "Browse"
    },
  ]

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "activity", label: "My Activity", icon: Activity },
    { id: "resources", label: "Resources", icon: BookOpen }
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
      case 'view':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'download':
        return <FileText className="h-4 w-4 text-green-500" />
      case 'access':
        return <Activity className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'chapter_partner':
        return 'Community Partner'
      case 'chapter_affiliate':
        return 'Community Affiliate'
      default:
        return 'Community Member'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'chapter_partner':
        return 'bg-green-500'
      case 'chapter_affiliate':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
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
                  Community Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {chapterName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="hidden sm:inline-flex">
                {getRoleDisplayName(user.role)}
              </Badge>
              
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`${getRoleColor(user.role)} text-white text-sm font-medium`}>
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
                          <AvatarFallback className={`${getRoleColor(user.role)} text-white font-medium`}>
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
                          <Badge variant="outline" className="mt-1">
                            {getRoleDisplayName(user.role)}
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
            {/* Welcome Message */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Welcome to WikiPeopleStats, {user.name}!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    You have access to view statistics and reports for Wikimedia projects. 
                    Explore the data and insights available to community members.
                  </p>
                </div>
              </CardContent>
            </Card>

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

            {/* Recent Activity & Available Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent platform activities</CardDescription>
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
                          <p className="text-xs text-gray-500 dark:text-gray-400">
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
                  <CardTitle>Available Resources</CardTitle>
                  <CardDescription>Tools and resources you can access</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableResources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <resource.icon className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {resource.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {resource.description}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          {resource.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "overview" && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {tabs.find(tab => tab.id === activeTab)?.label} content coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}