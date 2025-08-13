"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Calendar,
  MapPin,
  Shield,
  LogOut,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Session {
  id: number
  device_info: string
  ip_address: string
  origin_domain: string
  created_at: string
  last_used: string
  is_current: boolean
  location?: string
}

interface SessionStats {
  total_sessions: number
  active_sessions: number
  devices: string[]
  last_login_ip: string | null
}

export function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: number) => {
    setRevoking(sessionId)
    try {
      const response = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Session revoked successfully",
        })
        fetchSessions()
      } else {
        throw new Error("Failed to revoke session")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      })
    } finally {
      setRevoking(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ revokeAll: true }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "All other sessions revoked successfully",
        })
        fetchSessions()
      } else {
        throw new Error("Failed to revoke sessions")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke sessions",
        variant: "destructive",
      })
    }
  }

  const getDeviceIcon = (deviceInfo: string) => {
    const info = deviceInfo.toLowerCase()
    if (info.includes("mobile")) return <Smartphone className="h-4 w-4" />
    if (info.includes("tablet")) return <Tablet className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Session Overview
            </CardTitle>
            <CardDescription>Monitor your account security and active sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.active_sessions}</div>
                <div className="text-sm text-muted-foreground">Active Sessions</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{stats.total_sessions}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{stats.devices.length}</div>
                <div className="text-sm text-muted-foreground">Unique Devices</div>
              </div>
            </div>
            {stats.last_login_ip && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>Last login from: {stats.last_login_ip}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Manage your active login sessions across different devices</CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={revokeAllOtherSessions}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Revoke All Others
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No active sessions found. This might indicate a problem with session tracking.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <div key={session.id}>
                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      {getDeviceIcon(session.device_info)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.device_info}</span>
                          {session.is_current && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3" />
                            <span>{session.ip_address}</span>
                            {session.location && <span>• {session.location}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {formatDate(session.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Last used: {formatDate(session.last_used)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!session.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeSession(session.id)}
                        disabled={revoking === session.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {revoking === session.id ? (
                          "Revoking..."
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-2" />
                            Revoke
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {index < sessions.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Regularly review and revoke sessions from unfamiliar devices</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Always log out from public or shared computers</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Monitor your account for any suspicious activity</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SessionManager
