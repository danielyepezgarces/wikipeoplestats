"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Settings, Activity, BarChart3 } from "lucide-react"
import SessionManager from "./session-manager"

interface User {
  id: number
  name: string
  email: string
  role: string
  chapter?: string
}

interface ChapterAdminDashboardProps {
  user: User
}

export function ChapterAdminDashboard({ user }: ChapterAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Chapter Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.name}
            <Badge variant="secondary" className="ml-2">
              <Shield className="h-3 w-3 mr-1" />
              Chapter Admin
            </Badge>
            {user.chapter && (
              <Badge variant="outline" className="ml-2">
                {user.chapter}
              </Badge>
            )}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
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
          <Card>
            <CardHeader>
              <CardTitle>Chapter Overview</CardTitle>
              <CardDescription>Statistics and insights for your chapter</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chapter statistics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chapter Members</CardTitle>
              <CardDescription>Manage members of your chapter</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Member management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <SessionManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chapter Settings</CardTitle>
              <CardDescription>Configure chapter-specific settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chapter settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
