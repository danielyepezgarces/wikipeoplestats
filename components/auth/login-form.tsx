"use client"

import { useState } from "react"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface LoginFormProps {
  onLogin: (user: { email: string; name: string; role: string; chapter?: string }) => void
  onClose: () => void
}

export function LoginForm({ onLogin, onClose }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Demo users para Wikimedia Chapters
  const demoUsers = [
    { 
      email: "superadmin@wikimedia.org", 
      password: "super123", 
      name: "María González", 
      role: "super_admin",
      chapter: "Wikimedia Foundation"
    },
    { 
      email: "admin@wikimedia.es", 
      password: "admin123", 
      name: "Carlos Ruiz", 
      role: "community_admin",
      chapter: "Wikimedia España"
    },
    { 
      email: "moderator@wikimedia.mx", 
      password: "mod123", 
      name: "Ana López", 
      role: "community_moderator",
      chapter: "Wikimedia México"
    },
    { 
      email: "partner@wikimedia.ar", 
      password: "partner123", 
      name: "Diego Fernández", 
      role: "community_partner",
      chapter: "Wikimedia Argentina"
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = demoUsers.find(
      u => u.email === formData.email && u.password === formData.password
    )

    if (user) {
      toast({
        title: "Acceso autorizado",
        description: `Bienvenido/a, ${user.name}!`,
      })
      onLogin(user)
    } else {
      toast({
        title: "Error de autenticación",
        description: "Email o contraseña incorrectos",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setFormData({ email: user.email, password: user.password })
    onLogin(user)
    toast({
      title: "Acceso demo",
      description: `Conectado como ${user.name} (${getRoleDisplayName(user.role)})`,
    })
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Acceso al Sistema</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>
          <CardDescription>
            Sistema de gestión para Wikimedia Chapters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Ingresa tu email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verificando..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Cuentas Demo</span>
            </div>
          </div>

          <div className="space-y-2">
            {demoUsers.map((user) => (
              <Button
                key={user.email}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleDemoLogin(user)}
              >
                <div className="flex items-center space-x-2 w-full">
                  <div className={`w-3 h-3 rounded-full ${getRoleColor(user.role)}`} />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {getRoleDisplayName(user.role)} • {user.chapter}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="text-xs text-center text-muted-foreground">
            Sistema demo para Wikimedia Chapters. Usa cualquiera de las cuentas de arriba.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}