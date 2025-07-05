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
  Save,
  Menu,
  X,
  ChevronDown
} from "lucide-react"

const Button = ({ children, variant = "default", size = "default", className = "", onClick, disabled = false, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  }
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 text-sm",
    icon: "h-10 w-10"
  }
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6">
    {children}
  </div>
)

const CardTitle = ({ children }) => (
  <h3 className="text-2xl font-semibold leading-none tracking-tight">
    {children}
  </h3>
)

const CardDescription = ({ children }) => (
  <p className="text-sm text-muted-foreground">
    {children}
  </p>
)

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    outline: "border border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300"
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

const Avatar = ({ children, className = "" }) => (
  <div className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
)

const AvatarFallback = ({ children, className = "" }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full ${className}`}>
    {children}
  </div>
)

const Input = ({ className = "", ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
    {children}
  </label>
)

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const Switch = ({ id, checked, onCheckedChange }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange && onCheckedChange(!checked)}
    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? 'bg-blue-600' : 'bg-gray-200'
    }`}
  >
    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
      checked ? 'translate-x-5' : 'translate-x-0'
    }`} />
  </button>
)

interface DashboardContentProps {
  user: {
    name: string
    email: string
    role: string
    chapter?: string
  }
}

function DashboardContent({ user }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
    { action: "Nuevo chapter registrado", project: "Wikimedia Colombia", time: "2 min", type: "success" },
    { action: "Moderación aplicada", project: "eswiki", time: "15 min", type: "warning" },
    { action: "Estadísticas actualizadas", project: "frwiki", time: "1h", type: "info" },
    { action: "Nuevo socio afiliado", project: "Wikimedia Chile", time: "2h", type: "success" },
    { action: "Cache purgado", project: "Sistema Global", time: "3h", type: "info" },
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

  const tabs = [
    { id: "overview", label: "Resumen", icon: BarChart3 },
    { id: "chapters", label: "Chapters", icon: Globe },
    { id: "analytics", label: "Analíticas", icon: TrendingUp },
    { id: "moderation", label: "Moderación", icon: Shield },
    { id: "settings", label: "Config", icon: Settings }
  ]

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'community_admin':
        return 'Admin Comunidad'
      case 'community_moderator':
        return 'Moderador'
      case 'community_partner':
        return 'Socio/Afiliado'
      default:
        return role
    }
  }

  const getRoleBadgeVariant = (role) => {
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

  const getRoleColor = (role) => {
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

  // Función para generar iniciales desde el email
  const generateAvatarFromEmail = (email) => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const getActivityIcon = (type) => {
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
    console.log("Cerrando sesión...")
  }

  const canEditChapter = user.role === 'super_admin' || user.role === 'community_admin'
  const canModerate = user.role === 'super_admin' || user.role === 'community_admin' || user.role === 'community_moderator'
  const canManageUsers = user.role === 'super_admin' || user.role === 'community_admin'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Mejorado */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y Título */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => console.log("Ir al inicio")}
                className="lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="hidden lg:flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log("Ir al inicio")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Dashboard Wikimedia
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.chapter || 'Sistema Global'}
                  </p>
                </div>
              </div>
              <div className="lg:hidden">
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Dashboard
                </h1>
              </div>
            </div>
            
            {/* Menú de Usuario Mejorado */}
            <div className="flex items-center space-x-3">
              <Badge variant={getRoleBadgeVariant(user.role)} className="hidden sm:inline-flex">
                {getRoleDisplayName(user.role)}
              </Badge>
              
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`${getRoleColor(user.role)} text-white text-sm font-medium`}>
                      {generateAvatarFromEmail(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`${getRoleColor(user.role)} text-white font-medium`}>
                            {generateAvatarFromEmail(user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        Cerrar Sesión
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por Tabs Mejorada */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Tabs */}
          <div className="hidden lg:flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Mobile Tabs */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between py-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-5 w-5" />
                <span className="font-medium">
                  {tabs.find(tab => tab.id === activeTab)?.label || 'Menú'}
                </span>
              </button>
            </div>
            
            {isMobileMenuOpen && (
              <div className="absolute left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex items-center space-x-2 p-3 rounded-lg font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar el menú móvil */}
      {(isMobileMenuOpen || userMenuOpen) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
          onClick={() => {
            setIsMobileMenuOpen(false)
            setUserMenuOpen(false)
          }}
        />
      )}

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Content - Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {stat.change} este mes
                        </p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                  <CardDescription>
                    Acciones disponibles con tu rol de {getRoleDisplayName(user.role)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {permissions[user.role]?.map((permission, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {permission}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Otras pestañas simplificadas para el ejemplo */}
        {activeTab === "chapters" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Gestión de Chapters
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Administrar chapters de Wikimedia
                </p>
              </div>
              {user.role === 'super_admin' && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Chapter
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {chapters.map((chapter, index) => (
                <Card key={index}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          chapter.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {chapter.name}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span>{chapter.projects} proyectos</span>
                            <span>{chapter.users} usuarios</span>
                            <span>{chapter.moderators} moderadores</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        {canEditChapter && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder para otras pestañas */}
        {activeTab !== "overview" && activeTab !== "chapters" && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Contenido de la sección {tabs.find(tab => tab.id === activeTab)?.label} próximamente
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export { DashboardContent }