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
  FileText,
  Shield,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/hooks/use-i18n"

interface DashboardLayoutProps {
  user: {
    name: string
    email: string
    role: string
  }
  onClose: () => void
}

export function DashboardLayout({ user, onClose }: DashboardLayoutProps) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState("overview")

  const stats = [
    {
      title: "Total Projects",
      value: "847",
      change: "+12%",
      icon: Globe,
      color: "text-blue-500"
    },
    {
      title: "Active Users",
      value: "2,341",
      change: "+5%",
      icon: Users,
      color: "text-green-500"
    },
    {
      title: "Data Points",
      value: "1.2M",
      change: "+18%",
      icon: Database,
      color: "text-purple-500"
    },
    {
      title: "API Requests",
      value: "45.2K",
      change: "+23%",
      icon: Activity,
      color: "text-orange-500"
    }
  ]

  const recentActivities = [
    { action: "New project added", project: "eswiki", time: "2 minutes ago" },
    { action: "Cache purged", project: "frwiki", time: "15 minutes ago" },
    { action: "Statistics updated", project: "dewiki", time: "1 hour ago" },
    { action: "User registered", project: "Global", time: "2 hours ago" },
    { action: "API key generated", project: "Global", time: "3 hours ago" },
  ]

  const permissions = {
    admin: ["view", "edit", "delete", "manage_users", "system_settings"],
    editor: ["view", "edit", "manage_content"],
    viewer: ["view"]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold">WikiPeopleStats Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'editor' ? 'default' : 'secondary'}>
              {user.role.toUpperCase()}
            </Badge>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-500">{stat.change}</span> from last month
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
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
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.project} • {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Permissions</CardTitle>
                    <CardDescription>What you can do with your {user.role} role</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {permissions[user.role as keyof typeof permissions]?.map((permission, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-sm capitalize">{permission.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>Detailed statistics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Analytics charts would go here</p>
                      <p className="text-sm text-gray-400">Integration with your existing chart components</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Management</CardTitle>
                  <CardDescription>Manage WikiPeopleStats projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['enwiki', 'eswiki', 'frwiki', 'dewiki', 'wikidatawiki'].map((project, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{project}</h3>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {new Date().toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          {user.role !== 'viewer' && (
                            <Button size="sm" variant="outline">Edit</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Cache Management</h3>
                        <p className="text-sm text-muted-foreground">Manage system cache</p>
                      </div>
                      <Button variant="outline" disabled={user.role === 'viewer'}>
                        Purge All Cache
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">API Settings</h3>
                        <p className="text-sm text-muted-foreground">Configure API endpoints</p>
                      </div>
                      <Button variant="outline" disabled={user.role === 'viewer'}>
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">User Management</h3>
                        <p className="text-sm text-muted-foreground">Manage system users</p>
                      </div>
                      <Button variant="outline" disabled={user.role !== 'admin'}>
                        Manage Users
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}