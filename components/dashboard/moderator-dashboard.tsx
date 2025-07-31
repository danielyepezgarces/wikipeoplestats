"use client"

import { useState } from "react"
import { 
  BarChart3, 
  Activity, 
  Gavel,
  AlertTriangle,
  CheckCircle,
  Eye,
  ChevronDown,
  FileText,
  Clock,
  Flag,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ModeratorDashboardProps {
  user: {
    name: string
    email: string
    role: string
    chapter?: string
  }
}

export function ModeratorDashboard({ user }: ModeratorDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const chapterName = user.chapter || "Wikimedia España"

  const stats = [
    {
      title: "Pending Reviews",
      value: "12",
      change: "+3",
      icon: Clock,
      color: "text-orange-500"
    },
    {
      title: "Resolved Today",
      value: "8",
      change: "+2",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      title: "High Priority",
      value: "3",
      change: "-1",
      icon: AlertTriangle,
      color: "text-red-500"
    },
    {
      title: "Reports This Week",
      value: "24",
      change: "+5",
      icon: Flag,
      color: "text-blue-500"
    }
  ]

  const moderationQueue = [
    { 
      id: 1,
      type: "content", 
      title: "Inappropriate content reported", 
      project: "Spanish Wikipedia", 
      priority: "high",
      reporter: "User123",
      time: "5 min ago"
    },
    { 
      id: 2,
      type: "user", 
      title: "User behavior violation", 
      project: "Spanish Wikiquote", 
      priority: "medium",
      reporter: "Moderator456",
      time: "15 min ago"
    },
    { 
      id: 3,
      type: "copyright", 
      title: "Copyright infringement claim", 
      project: "Spanish Wikisource", 
      priority: "high",
      reporter: "LegalTeam",
      time: "30 min ago"
    },
    { 
      id: 4,
      type: "spam", 
      title: "Spam content detected", 
      project: "Spanish Wikipedia", 
      priority: "low",
      reporter: "AutoMod",
      time: "1 hour ago"
    },
  ]

  const recentActions = [
    { action: "Approved article edit", project: "Spanish Wikipedia", time: "10 min", status: "approved" },
    { action: "Removed inappropriate comment", project: "Spanish Wikiquote", time: "25 min", status: "removed" },
    { action: "Warned user for policy violation", project: "Spanish Wikipedia", time: "45 min", status: "warning" },
    { action: "Resolved copyright dispute", project: "Spanish Wikisource", time: "1h", status: "resolved" },
  ]

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "queue", label: "Moderation Queue", icon: Gavel },
    { id: "reports", label: "Reports", icon: Flag },
    { id: "history", label: "History", icon: FileText }
  ]

  const generateAvatarFromEmail = (email: string) => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <FileText className="h-4 w-4" />
      case 'user':
        return <MessageSquare className="h-4 w-4" />
      case 'copyright':
        return <AlertTriangle className="h-4 w-4" />
      case 'spam':
        return <Flag className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600'
      case 'removed':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'resolved':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
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
                  Moderator Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {chapterName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Moderator
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
                          <AvatarFallback className="bg-blue-500 text-white font-medium">
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
                          <Badge variant="secondary" className="mt-1">
                            Moderator
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
                          {stat.change} today
                        </p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Urgent Items & Recent Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Urgent Items</CardTitle>
                  <CardDescription>High priority items requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moderationQueue.filter(item => item.priority === 'high').map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(item.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.project} • {item.time}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Actions</CardTitle>
                  <CardDescription>Your recent moderation activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActions.map((action, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <CheckCircle className={`h-4 w-4 ${getStatusColor(action.status)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {action.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {action.project} • {action.time} ago
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "queue" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Moderation Queue
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Items requiring your review and action
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {moderationQueue.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getTypeIcon(item.type)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {item.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span>{item.project}</span>
                            <span>•</span>
                            <span>Reported by {item.reporter}</span>
                            <span>•</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <Button size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "overview" && activeTab !== "queue" && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Moderator {tabs.find(tab => tab.id === activeTab)?.label} content coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
