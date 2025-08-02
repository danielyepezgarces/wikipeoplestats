"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  Trash2,
  RefreshCw,
} from "lucide-react"
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
import { useRouter } from "next/navigation"

interface Session {
  id: string
  userId: number
  username: string
  createdAt: string
  expiresAt: string
  lastUsed: string
  origin: string
  userAgent?: string
  ipAddress?: string
  deviceInfo?: string
  isActive: boolean
  is_current?: boolean
}

interface SessionStats {
  totalSessions: number
  activeSessions: number
  expiredSessions: number
  devicesUsed: string[]
}

export function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [revokingAll, setRevokingAll] = useState(false)
  const router = useRouter()

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions")
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login")
          return
        }
        throw new Error("Failed to fetch sessions")
      }
      const data = await response.json()
      setSessions(data.sessions || [])
      setStats(data.stats || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId)
    try {
      const response = await fetch(`/api/auth/sessions?session_id=${sessionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to revoke session")
      }

      await fetchSessions()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke session")
    } finally {
      setRevoking(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    setRevokingAll(true)
    try {
      const response = await fetch("/api/auth/sessions?action=revoke_all_others", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to revoke sessions")
      }

      await fetchSessions()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke sessions")
    } finally {
      setRevokingAll(false)
    }
  }

  const getDeviceIcon = (deviceInfo?: string) => {
    if (!deviceInfo) return <Globe className="h-4 w-4" />

    const info = deviceInfo.toLowerCase()
    if (info.includes("mobile") || info.includes("android") || info.includes("iphone")) {
      return <Smartphone className="h-4 w-4" />
    }
    if (info.includes("tablet") || info.includes("ipad")) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const formatLastUsed = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage your active login sessions across devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentSession = sessions.find((s) => s.is_current)
  const otherSessions = sessions.filter((s) => !s.is_current)

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.activeSessions}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.devicesUsed.length}</div>
              <div className="text-sm text-muted-foreground">Devices Used</div>
            </CardContent>
          </Card>
        </div>
      )}

      {sessions.length > 1 && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You have {sessions.length} active sessions. For security, consider revoking sessions you don't recognize.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Active Sessions ({sessions.length})
            </CardTitle>
            <CardDescription>Manage your active login sessions across devices</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {otherSessions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={revokingAll}>
                    {revokingAll ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Revoke All Others
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke All Other Sessions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out of all other devices and browsers. You will remain signed in on this
                      device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={revokeAllOtherSessions}>Revoke All Others</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No active sessions found</div>
          ) : (
            <>
              {/* Current Session */}
              {currentSession && (
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getDeviceIcon(currentSession.deviceInfo)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{currentSession.deviceInfo || "Unknown Device"}</span>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            Current Session
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {currentSession.ipAddress || "Unknown IP"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {currentSession.origin}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last active: {formatLastUsed(currentSession.lastUsed)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Sessions */}
              {otherSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getDeviceIcon(session.deviceInfo)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.deviceInfo || "Unknown Device"}</span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.ipAddress || "Unknown IP"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {session.origin}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last active: {formatLastUsed(session.lastUsed)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={revoking === session.id}>
                          {revoking === session.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Revoke
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will sign out this device/browser immediately. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => revokeSession(session.id)}>
                            Revoke Session
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SessionManager
