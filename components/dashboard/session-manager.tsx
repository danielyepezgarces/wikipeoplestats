"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Monitor, Smartphone, Tablet, MapPin, Clock, Shield } from "lucide-react"
import { toast } from "sonner"

interface Session {
  id: string
  createdAt: string
  lastActivity: string
  expiresAt: string
  deviceInfo?: string
  ipAddress?: string
  origin?: string
  isCurrent: boolean
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/sessions")

      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
      } else {
        toast.error("Error loading sessions")
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
      toast.error("Error loading sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/sessions?sessionId=${sessionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Session revoked successfully")
        loadSessions()
      } else {
        toast.error("Error revoking session")
      }
    } catch (error) {
      console.error("Error revoking session:", error)
      toast.error("Error revoking session")
    }
  }

  const revokeAllSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions?all=true", {
        method: "DELETE",
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Revoked ${data.revokedCount} sessions`)
        loadSessions()
      } else {
        toast.error("Error revoking sessions")
      }
    } catch (error) {
      console.error("Error revoking sessions:", error)
      toast.error("Error revoking sessions")
    }
  }

  const getDeviceIcon = (deviceInfo?: string) => {
    if (!deviceInfo) return <Monitor className="h-4 w-4" />

    const info = deviceInfo.toLowerCase()
    if (info.includes("mobile") || info.includes("iphone") || info.includes("android")) {
      return <Smartphone className="h-4 w-4" />
    }
    if (info.includes("tablet") || info.includes("ipad")) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Loading your active sessions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>Manage your active sessions across different devices</CardDescription>
          </div>
          {sessions.length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Revoke All Others
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke All Other Sessions?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will log you out from all other devices and browsers. Your current session will remain active.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={revokeAllSessions}>Revoke All Others</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-4 border rounded-lg ${
                session.isCurrent ? "border-green-200 bg-green-50" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">{getDeviceIcon(session.deviceInfo)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.deviceInfo || "Unknown Device"}
                    </p>
                    {session.isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {session.ipAddress && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{session.ipAddress}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Last active {getTimeAgo(session.lastActivity)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Created: {formatDate(session.createdAt)}
                    {session.origin && ` • Origin: ${session.origin}`}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                {!session.isCurrent && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will log out this device/browser. You'll need to sign in again on that device.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => revokeSession(session.id)}>Revoke Session</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active sessions found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
