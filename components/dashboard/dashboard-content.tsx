"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  ArrowLeft,
  Gavel,
  Handshake,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Trash2,
  Plus,
  Layout,
  Palette,
  Code,
  Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useI18n } from "@/hooks/use-i18n"
import { useAuth } from "@/hooks/use-auth"

interface DashboardContentProps {
  user: {
    name: string
    email: string
    role: string
    chapter?: string
  }
}

export function DashboardContent({ user }: DashboardContentProps) {
  const { t } = useI18n()
  const { logout } = useAuth()
  const router = useRouter()
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
      "Editar layout del chapter",
      "Moderar contenido"
    ],
    community_moderator: [
      "Moderar contenido del chapter asignado",
      "Ver estadísticas básicas del chapter",
      "Gestionar reportes del chapter",
      "Aplicar políticas de comunidad",
      "Acceso limitado a herramientas"
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500'
      case 'community_admin':
        return 'bg-orange-500'
      case 'community_moderator':
        return 'bg-blue-500'
      case 'community_partner':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
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
    { name: "Wikimedia España", projects: 12, users: 234, status: "active", moderators: 5 },
    { name: "Wikimedia México", projects: 8, users: 156, status: "active", moderators: 3 },
    { name: "Wikimedia Argentina", projects: 15, users: 289, status: "active", moderators: 7 },
    { name: "Wikimedia Colombia", projects: 6, users: 98, status: "pending", moderators: 2 },
    { name: "Wikimedia Chile", projects: 10, users: 167, status: "active", moderators: 4 },
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const canEditChapter = user.role === 'super_admin' || user.role === 'community_admin'
  const canModerate = user.role === 'super_admin' || user.role === 'community_admin' || user.role === 'community_moderator'
  const canManageUsers = user.role === 'super_admin' || user.role === 'community_admin'

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Panel de Control - Wikimedia Chapters
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.chapter || 'Sistema Global'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleDisplayName(user.role)}
              </Badge>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`${getRoleColor(user.role)} text-white text-sm`}>
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestión de Chapters</h2>
                <p className="text-muted-foreground">Administrar chapters de Wikimedia</p>
              </div>
              {user.role === 'super_admin' && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Chapter
                </Button>
              )}
            </div>

            <div className="grid gap-6">
              {chapters.map((chapter, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${
                          chapter.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <h3 className="text-lg font-semibold">{chapter.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{chapter.projects} proyectos</span>
                            <span>{chapter.users} usuarios</span>
                            <span>{chapter.moderators} moderadores</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                        {canEditChapter && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Layout
                          </Button>
                        )}
                        {user.role === 'super_admin' && (
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Panel de Analíticas</CardTitle>
                <CardDescription>Estadísticas detalladas y tendencias de WikiPeopleStats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Gráficos de WikiPeopleStats
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Aquí se integrarán tus componentes de gráficos existentes
                    </p>
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Estadísticas de Género
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Usuarios Activos
                      </Button>
                      <Button variant="outline" size="sm">
                        <Globe className="h-4 w-4 mr-2" />
                        Proyectos por País
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Panel de Moderación</h2>
                <p className="text-muted-foreground">
                  {user.role === 'community_moderator' 
                    ? `Herramientas de moderación para ${user.chapter}`
                    : 'Herramientas de moderación para la comunidad'
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-medium">Reportes Pendientes</h3>
                  <p className="text-2xl font-bold">
                    {user.role === 'community_moderator' ? '3' : '12'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.role === 'community_moderator' ? `En ${user.chapter}` : 'Total del sistema'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-medium">Resueltos Hoy</h3>
                  <p className="text-2xl font-bold">
                    {user.role === 'community_moderator' ? '2' : '8'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.role === 'community_moderator' ? `En ${user.chapter}` : 'Total del sistema'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-medium">Usuarios Activos</h3>
                  <p className="text-2xl font-bold">
                    {user.role === 'community_moderator' ? '45' : '234'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.role === 'community_moderator' ? `En ${user.chapter}` : 'Total del sistema'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {canModerate ? (
              <Card>
                <CardHeader>
                  <CardTitle>Herramientas de Moderación</CardTitle>
                  <CardDescription>
                    {user.role === 'community_moderator' 
                      ? `Permisos limitados al chapter: ${user.chapter}`
                      : 'Acceso completo a herramientas de moderación'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Gavel className="h-6 w-6 mb-2" />
                      Revisar Reportes
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Shield className="h-6 w-6 mb-2" />
                      Aplicar Políticas
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      Gestionar Usuarios
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      Generar Reportes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Sin Permisos de Moderación
                  </h3>
                  <p className="text-gray-500">
                    Tu rol de {getRoleDisplayName(user.role)} no incluye permisos de moderación.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chapter Layout Configuration */}
              {canEditChapter && (
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Layout del Chapter</CardTitle>
                    <CardDescription>
                      Personalizar la apariencia de WikiPeopleStats para tu chapter
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="chapter-name">Nombre del Chapter</Label>
                      <Input id="chapter-name" defaultValue={user.chapter} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chapter-description">Descripción</Label>
                      <Textarea 
                        id="chapter-description" 
                        placeholder="Descripción del chapter para mostrar en WikiPeopleStats"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Configuración Visual</Label>
                      <div className="flex items-center space-x-2">
                        <Switch id="custom-colors" />
                        <Label htmlFor="custom-colors">Usar colores personalizados</Label>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Vista Previa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* System Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                  <CardDescription>Configurar preferencias del sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Gestión de Cache</h3>
                      <p className="text-sm text-muted-foreground">Administrar cache del sistema</p>
                    </div>
                    <Button variant="outline" size="sm" disabled={user.role === 'community_partner'}>
                      Purgar Cache
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Configuración API</h3>
                      <p className="text-sm text-muted-foreground">Configurar endpoints de API</p>
                    </div>
                    <Button variant="outline" size="sm" disabled={user.role === 'community_partner'}>
                      Configurar
                    </Button>
                  </div>
                  {canManageUsers && (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Gestión de Usuarios</h3>
                        <p className="text-sm text-muted-foreground">
                          {user.role === 'community_admin' 
                            ? `Administrar usuarios de ${user.chapter}`
                            : 'Administrar todos los usuarios del sistema'
                          }
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Gestionar Usuarios
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notificaciones</h3>
                      <p className="text-sm text-muted-foreground">Configurar alertas y notificaciones</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}