"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Calendar,
  MapPin,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Session {
  id: number
  device_info?: string
  user_agent?: string
  ip_address?: string
  origin_domain: string
  created_at: string
  last_used: string
  expires_at: string
  is_active: boolean
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
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
        setStats(data.stats || null)
      } else {
        throw new Error("Failed to load sessions")
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load session information",
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
        loadSessions()
      } else {
        throw new Error("Failed to revoke session")
      }
    } catch (error) {
      console.error("Error revoking session:", error)
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
        loadSessions()
      } else {
        throw new Error("Failed to revoke sessions")
      }
    } catch (error) {
      console.error("Error revoking sessions:", error)
      toast({
        title: "Error",
        description: "Failed to revoke sessions",
        variant: "destructive",
      })
    }
  }

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />

    const ua = userAgent.toLowerCase()
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return <Smartphone className="h-4 w-4" />
    }
    if (ua.includes("tablet") || ua.includes("ipad")) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isCurrentSession = (session: Session) => {
    // This would need to be determined by comparing with current session
    // For now, we'll assume the most recently used session is current
    const mostRecent = sessions.reduce((latest, current) =>
      new Date(current.last_used) > new Date(latest.last_used) ? current : latest,
    )
    return session.id === mostRecent?.id
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Loading session information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active_sessions}</div>
                <div className="text-sm text-muted-foreground">Active Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total_sessions}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.devices.length}</div>
                <div className="text-sm text-muted-foreground">Unique Devices</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-mono">{stats.last_login_ip || "Unknown"}</div>
                <div className="text-sm text-muted-foreground">Last Login IP</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions across different devices and browsers</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No active sessions found. This might indicate a problem with session loading.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getDeviceIcon(session.user_agent)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.device_info || "Unknown Device"}</span>
                          {isCurrentSession(session) && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Current Session
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span>{session.origin_domain}</span>
                          </div>

                          {session.ip_address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{session.ip_address}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Last used: {formatDate(session.last_used)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {formatDate(session.created_at)}</span>
                          </div>
                        </div>

                        {session.user_agent && (
                          <details className="text-xs text-muted-foreground">
                            <summary className="cursor-pointer hover:text-foreground">User Agent</summary>
                            <p className="mt-1 font-mono break-all">{session.user_agent}</p>
                          </details>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCurrentSession(session) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeSession(session.id)}
                          disabled={revoking === session.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {revoking === session.id ? "Revoking..." : "Revoke"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  You can revoke sessions from devices you no longer use or trust
                </div>
                <Button variant="destructive" onClick={revokeAllOtherSessions} disabled={sessions.length <= 1}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Revoke All Other Sessions
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SessionManager
