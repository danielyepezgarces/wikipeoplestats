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
  BookOpen,
  Monitor,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SessionManager from "./session-manager"

interface UserType {
  id: number
  name: string
  email: string
  role: string
}

interface DefaultDashboardProps {
  user: UserType
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
      color: "text-blue-500",
    },
    {
      title: "Projects Accessed",
      value: "8",
      change: "+2",
      icon: BookOpen,
      color: "text-green-500",
    },
    {
      title: "Community Rank",
      value: "#234",
      change: "+12",
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Active Days",
      value: "15",
      change: "+3",
      icon: Activity,
      color: "text-orange-500",
    },
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
      action: "View Stats",
    },
    {
      title: "Community Guidelines",
      description: "Learn about community policies and best practices",
      icon: BookOpen,
      action: "Read More",
    },
    {
      title: "Help Center",
      description: "Get help and support for using the platform",
      icon: FileText,
      action: "Get Help",
    },
    {
      title: "User Directory",
      description: "Connect with other community members",
      icon: Users,
      action: "Browse",
    },
  ]

  const generateAvatarFromEmail = (email: string) => {
    const parts = email.split("@")[0].split(".")
    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "view":
        return <Eye className="h-4 w-4 text-blue-500" />
      case "download":
        return <FileText className="h-4 w-4 text-green-500" />
      case "access":
        return <Activity className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Community Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{chapterName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="hidden sm:inline-flex">
                {user.role}
              </Badge>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                      {generateAvatarFromEmail(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">{user.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-500 text-white font-medium">
                            {generateAvatarFromEmail(user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                          <Badge variant="outline" className="mt-1">
                            {user.role}
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  My Activity
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to WikiPeopleStats</CardTitle>
                    <CardDescription>Your personal dashboard for Wikipedia statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Explore Wikipedia statistics, track your contributions, and discover insights about Wikipedia
                      editors.
                    </p>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {stats.map((stat, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                            <p className="text-sm text-green-600 dark:text-green-400">{stat.change} this month</p>
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
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
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
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{resource.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{resource.description}</p>
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
              </TabsContent>

              <TabsContent value="sessions" className="space-y-6">
                <SessionManager />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences and settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Account settings coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
