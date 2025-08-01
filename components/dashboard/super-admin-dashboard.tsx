"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Settings, Activity, Database, BarChart3 } from "lucide-react"
import { DashboardStats } from "./admin/DashboardStats"
import { UsersSection } from "./admin/UsersSection"
import { ChaptersSection } from "./admin/ChaptersSection"
import { RoleManagement } from "../admin/role-management"
import SessionManager from "./session-manager"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface SuperAdminDashboardProps {
  user: User
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Super Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.name}
            <Badge variant="destructive" className="ml-2">
              <Shield className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="chapters" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Chapters
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DashboardStats />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersSection />
        </TabsContent>

        <TabsContent value="chapters" className="space-y-6">
          <ChaptersSection />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <SessionManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
