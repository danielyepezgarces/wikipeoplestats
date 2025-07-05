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
  X,
  Gavel,
  Handshake,
  UserCheck,
  AlertTriangle,
  CheckCircle
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
    chapter?: string
  }
  onClose: () => void
}

export function DashboardLayout({ user, onClose }: DashboardLayoutProps) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState("overview")

  const stats = [
    {
      title: "Chapters Activos",
      value: "47",
      change: "+3",
      icon: Globe,
      color: "text-blue-500"
    },
    {
      title: "Usuarios Registrados",
      value: "2,341",
      change: "+127",
      icon: Users,
      color: "text-green-500"
    },
    {
      title: "Proyectos Monitoreados",
      value: "847",
      change: "+12",
      icon: Database,
      color: "text-purple-500"
    },
    {
      title: "Consultas API/día",
      value: "45.2K",
      change: "+23%",
      icon: Activity,
      color: "text-orange-500"
    }
  ]

  const recentActivities = [
    { action: "Nuevo chapter registrado", project: "Wikimedia Colombia", time: "2 minutos", type: "success" },
    { action: "Moderación aplicada", project: "eswiki", time: "15 minutos", type: "warning" },
    { action: "Estadísticas actualizadas", project: "frwiki", time: "1 hora", type: "info" },
    { action: "Nuevo socio afiliado", project: "Wikimedia Chile", time: "2 horas", type: "success" },
    { action: "Cache purgado", project: "Sistema Global", time: "3 horas", type: "info" },
  ]

  const permissions = {
    super_admin: [
      "Gestión completa del sistema",
      "Administrar todos los chapters",
      "Configuración global",
      "Gestión de usuarios",
      "Acceso a logs del sistema",
      "Configuración de API"
    ],
    community_admin: [
      "Administrar su chapter",
      "Gestionar usuarios del chapter",
      "Ver estadísticas del chapter",
      "Configurar proyectos",
      "Moderar contenido"
    ],
    community_moderator: [
      "Moderar contenido del chapter",
      "Ver estadísticas básicas",
      "Gestionar reportes",
      "Aplicar políticas de comunidad"
    ],
    community_partner: [
      "Ver estadísticas del chapter",
      "Acceso a datos públicos",
      "Generar reportes básicos",
      "Participar en discusiones"
    ]
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrador'
      case 'community_admin':
        return 'Administrador de Comunidad'
      case 'community_moderator':
        return 'Moderador de Comunidad'
      case 'community_partner':
        return 'Socio/Afiliado de Comunidad'
      default:
        return role
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive'
      case 'community_admin':
        return 'default'
      case 'community_moderator':
        return 'secondary'
      case 'community_partner':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const chapters = [
    { name: "Wikimedia España", projects: 12, users: 234, status: "active" },
    { name: "Wikimedia México", projects: 8, users: 156, status: "active" },
    { name: "Wikimedia Argentina", projects: 15, users: 289, status: "active" },
    { name: "Wikimedia Colombia", projects: 6, users: 98, status: "pending" },
    { name: "Wikimedia Chile", projects: 10, users: 167, status: "active" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold">Panel de Control - Wikimedia Chapters</h1>
            <p className="text-muted-foreground">Bienvenido/a, {user.name}</p>
            {user.chapter && (
              <p className="text-sm text-blue-600 dark:text-blue-400">{user.chapter}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {getRoleDisplayName(user.role)}
            </Badge>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="analytics">Analíticas</TabsTrigger>
              <TabsTrigger value="moderation">Moderación</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
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
                        <span className="text-green-500">{stat.change}</span> este mes
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity & Permissions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Últimas actividades del sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.project} • hace {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tus Permisos</CardTitle>
                    <CardDescription>Acciones disponibles con tu rol de {getRoleDisplayName(user.role)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {permissions[user.role as keyof typeof permissions]?.map((permission, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="chapters" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Chapters</CardTitle>
                  <CardDescription>Administrar chapters de Wikimedia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chapters.map((chapter, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            chapter.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          <div>
                            <h3 className="font-medium">{chapter.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {chapter.projects} proyectos • {chapter.users} usuarios
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Ver</Button>
                          {(user.role === 'super_admin' || user.role === 'community_admin') && (
                            <Button size="sm" variant="outline">Gestionar</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Panel de Analíticas</CardTitle>
                  <CardDescription>Estadísticas detalladas y tendencias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Gráficos de analíticas integrados</p>
                      <p className="text-sm text-gray-400">Conectado con tus componentes de gráficos existentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="moderation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Panel de Moderación</CardTitle>
                  <CardDescription>Herramientas de moderación para la comunidad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <h3 className="font-medium">Reportes Pendientes</h3>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h3 className="font-medium">Resueltos Hoy</h3>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <h3 className="font-medium">Usuarios Activos</h3>
                        <p className="text-2xl font-bold">234</p>
                      </div>
                    </div>
                    {(user.role === 'community_moderator' || user.role === 'community_admin' || user.role === 'super_admin') ? (
                      <div className="text-center py-8">
                        <Gavel className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <p className="text-gray-500">Herramientas de moderación disponibles</p>
                        <Button className="mt-4">Acceder a Moderación</Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No tienes permisos de moderación</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                  <CardDescription>Configurar preferencias del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Gestión de Cache</h3>
                        <p className="text-sm text-muted-foreground">Administrar cache del sistema</p>
                      </div>
                      <Button variant="outline" disabled={user.role === 'community_partner'}>
                        Purgar Cache
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Configuración API</h3>
                        <p className="text-sm text-muted-foreground">Configurar endpoints de API</p>
                      </div>
                      <Button variant="outline" disabled={user.role === 'community_partner'}>
                        Configurar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Gestión de Usuarios</h3>
                        <p className="text-sm text-muted-foreground">Administrar usuarios del sistema</p>
                      </div>
                      <Button variant="outline" disabled={user.role !== 'super_admin' && user.role !== 'community_admin'}>
                        Gestionar Usuarios
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Configuración de Chapter</h3>
                        <p className="text-sm text-muted-foreground">Configurar tu chapter local</p>
                      </div>
                      <Button variant="outline" disabled={user.role === 'community_partner'}>
                        Configurar Chapter
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