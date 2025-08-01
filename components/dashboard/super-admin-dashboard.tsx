"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardStats } from "./admin/DashboardStats"
import { UsersSection } from "./admin/UsersSection"
import { ChaptersSection } from "./admin/ChaptersSection"
import { SessionManager } from "./session-manager"
import { Shield, Users, Building, BarChart3, Settings } from "lucide-react"

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back, {user.name}</p>
          </div>
          <Badge variant="destructive" className="text-sm">
            <Shield className="h-4 w-4 mr-1" />
            Super Admin
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="chapters" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Chapters
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
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

        <TabsContent value="sessions" className="space-y-6">
          <SessionManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure global system settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">System settings panel coming soon...</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
