"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Monitor, Smartphone, Tablet, MapPin, Clock, Shield, LogOut, AlertTriangle, Activity } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Session {
  id: number
  user_id: number
  device_info: string
  ip_address: string
  origin_domain: string
  created_at: string
  last_used: string
  is_active: boolean
}

interface SessionStats {
  total_sessions: number
  active_sessions: number
  devices: string[]
  last_login_ip: string | null
}

interface SessionData {
  sessions: Session[]
  stats: SessionStats
  current_session_id: number | null
}

export default function SessionManager() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<number | null>(null)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false)
  const [sessionToRevoke, setSessionToRevoke] = useState<number | null>(null)

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
      } else if (response.status === 401) {
        // Token revocado o inválido, redirigir al login
        window.location.href = "/login"
      } else {
        toast.error("Error al cargar las sesiones")
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: number) => {
    setRevoking(sessionId)
    try {
      const response = await fetch(`/api/auth/sessions?session_id=${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        toast.success("Sesión revocada exitosamente")
        await fetchSessions()
      } else if (response.status === 401) {
        window.location.href = "/login"
      } else {
        toast.error("Error al revocar la sesión")
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setRevoking(null)
      setShowRevokeDialog(false)
      setSessionToRevoke(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    setRevoking(-1)
    try {
      const response = await fetch("/api/auth/sessions?action=revoke_all_others", {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        await fetchSessions()
      } else if (response.status === 401) {
        window.location.href = "/login"
      } else {
        toast.error("Error al revocar las sesiones")
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setRevoking(null)
      setShowRevokeAllDialog(false)
    }
  }

  const getDeviceIcon = (deviceInfo: string) => {
    const info = deviceInfo.toLowerCase()
    if (info.includes("mobile") || info.includes("android") || info.includes("iphone")) {
      return <Smartphone className="h-4 w-4" />
    } else if (info.includes("tablet") || info.includes("ipad")) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Ahora mismo"
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`
  }

  useEffect(() => {
    fetchSessions()

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No se pudieron cargar las sesiones. Intenta recargar la página.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sessionData.stats.active_sessions}</div>
            <p className="text-xs text-muted-foreground">de {sessionData.stats.total_sessions} totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionData.stats.devices.length}</div>
            <p className="text-xs text-muted-foreground">dispositivos únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última IP</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">{sessionData.stats.last_login_ip || "N/A"}</div>
            <p className="text-xs text-muted-foreground">último acceso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seguridad</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓</div>
            <p className="text-xs text-muted-foreground">estado normal</p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Acciones de Seguridad
          </CardTitle>
          <CardDescription>Gestiona tus sesiones activas para mantener tu cuenta segura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowRevokeAllDialog(true)}
              disabled={revoking === -1 || sessionData.sessions.length <= 1}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {revoking === -1 ? "Revocando..." : "Cerrar Otras Sesiones"}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loading}>
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de sesiones */}
      <Card>
        <CardHeader>
          <CardTitle>Sesiones Activas</CardTitle>
          <CardDescription>Todas las sesiones actualmente conectadas a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionData.sessions.map((session, index) => (
            <div key={session.id}>
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{getDeviceIcon(session.device_info)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device_info}</p>
                      {session.id === sessionData.current_session_id && (
                        <Badge variant="secondary" className="text-xs">
                          Sesión Actual
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{session.ip_address}</span>
                        <span>•</span>
                        <span>{session.origin_domain}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Última actividad: {getTimeAgo(session.last_used)}</span>
                      </div>
                      <div className="text-xs">Creada: {formatDate(session.created_at)}</div>
                    </div>
                  </div>
                </div>
                {session.id !== sessionData.current_session_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSessionToRevoke(session.id)
                      setShowRevokeDialog(true)
                    }}
                    disabled={revoking === session.id}
                  >
                    {revoking === session.id ? "Revocando..." : "Revocar"}
                  </Button>
                )}
              </div>
              {index < sessionData.sessions.length - 1 && <Separator className="my-4" />}
            </div>
          ))}

          {sessionData.sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay sesiones activas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para revocar sesión individual */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revocar Sesión</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres revocar esta sesión? La sesión se cerrará inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToRevoke && revokeSession(sessionToRevoke)}
              className="bg-red-600 hover:bg-red-700"
            >
              Revocar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para revocar todas las otras sesiones */}
      <AlertDialog open={showRevokeAllDialog} onOpenChange={setShowRevokeAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revocar Todas las Otras Sesiones</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres revocar todas las otras sesiones? Esto cerrará todas las sesiones excepto la
              actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={revokeAllOtherSessions} className="bg-red-600 hover:bg-red-700">
              Revocar Todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
