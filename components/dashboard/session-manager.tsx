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
import { Separator } from "@/components/ui/separator"
import { Monitor, Smartphone, Tablet, MapPin, Clock, Shield, Trash2, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Session {
  id: number
  device_name: string
  browser: string
  location: string
  created_at: string
  last_used: string
  is_current: boolean
  ip_address?: string
  user_agent?: string
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
}

export function SessionManager() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
      } else {
        throw new Error("Failed to fetch sessions")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las sesiones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: number) => {
    setRevoking(sessionId)
    try {
      const response = await fetch(`/api/auth/sessions?sessionId=${sessionId}&action=revoke`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Sesión revocada",
          description: "La sesión ha sido revocada exitosamente",
        })
        fetchSessions()
      } else {
        throw new Error("Failed to revoke session")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo revocar la sesión",
        variant: "destructive",
      })
    } finally {
      setRevoking(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions?action=revoke-others", {
        method: "DELETE",
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Sesiones revocadas",
          description: data.message,
        })
        fetchSessions()
      } else {
        throw new Error("Failed to revoke sessions")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron revocar las sesiones",
        variant: "destructive",
      })
    }
  }

  const revokeAllSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions?action=revoke-all", {
        method: "DELETE",
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Todas las sesiones revocadas",
          description: data.message,
        })
        // Redirigir al login ya que se revocó la sesión actual
        window.location.href = "/login"
      } else {
        throw new Error("Failed to revoke all sessions")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron revocar todas las sesiones",
        variant: "destructive",
      })
    }
  }

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.toLowerCase().includes("mobile")) return <Smartphone className="h-4 w-4" />
    if (deviceName.toLowerCase().includes("tablet")) return <Tablet className="h-4 w-4" />
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

  useEffect(() => {
    fetchSessions()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Sesiones</CardTitle>
          <CardDescription>Cargando sesiones activas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!sessionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Sesiones</CardTitle>
          <CardDescription>Error al cargar las sesiones</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Resumen de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sessionData.stats.active_sessions}</div>
              <div className="text-sm text-muted-foreground">Sesiones Activas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sessionData.stats.total_sessions}</div>
              <div className="text-sm text-muted-foreground">Total Sesiones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{sessionData.stats.devices.length}</div>
              <div className="text-sm text-muted-foreground">Dispositivos</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-mono text-orange-600">{sessionData.stats.last_login_ip || "N/A"}</div>
              <div className="text-sm text-muted-foreground">Última IP</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sesiones Activas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sesiones Activas</CardTitle>
              <CardDescription>Gestiona tus sesiones activas en diferentes dispositivos</CardDescription>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Otras
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cerrar otras sesiones?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esto cerrará todas las sesiones excepto la actual. Tendrás que volver a iniciar sesión en otros
                      dispositivos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={revokeAllOtherSessions}>Cerrar Otras Sesiones</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cerrar Todas
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cerrar todas las sesiones?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esto cerrará TODAS las sesiones, incluyendo la actual. Serás redirigido al login.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={revokeAllSessions} className="bg-red-600 hover:bg-red-700">
                      Cerrar Todas las Sesiones
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessionData.sessions.map((session, index) => (
              <div key={session.id}>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.device_name)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.device_name}</span>
                          {session.is_current && (
                            <Badge variant="secondary" className="text-xs">
                              Sesión Actual
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{session.browser}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.last_used)}
                      </div>
                    </div>

                    {!session.is_current && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={revoking === session.id}>
                            {revoking === session.id ? "Revocando..." : "Revocar"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Revocar esta sesión?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción cerrará la sesión en {session.device_name}. El usuario tendrá que volver a
                              iniciar sesión.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => revokeSession(session.id)}>
                              Revocar Sesión
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                {index < sessionData.sessions.length - 1 && <Separator className="my-2" />}
              </div>
            ))}

            {sessionData.sessions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No hay sesiones activas</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
