"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Globe, Users, Shield, BookOpen, AlertCircle, X } from "lucide-react"

interface LoginFormProps {
  onLogin: (user: {
    id: string
    email?: string
    name: string
    role: string
    chapter?: string
    wikipediaUsername: string
    avatarUrl?: string
  }) => void
  onClose: () => void
}

export function LoginForm({ onLogin, onClose }: LoginFormProps) {
  const { user, isAuthenticated, login, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentChapter, setCurrentChapter] = useState<string>("Global")

  useEffect(() => {
    // Si ya está autenticado, pasar los datos al componente padre
    if (isAuthenticated && user) {
      onLogin({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        chapter: user.chapter,
        wikipediaUsername: user.wikipediaUsername,
        avatarUrl: user.avatarUrl,
      })
      toast({
        title: "Acceso autorizado",
        description: `¡Bienvenido/a, ${user.name}!`,
      })
      return
    }

    // Detectar chapter basado en el subdominio
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      const subdomain = hostname.split(".")[0]

      const chapterMap: Record<string, string> = {
        es: "Wikimedia España",
        mx: "Wikimedia México",
        ar: "Wikimedia Argentina",
        global: "Wikimedia Global",
      }

      setCurrentChapter(chapterMap[subdomain] || "Wikimedia Global")
    }

    // Manejar errores de autenticación
    const errorParam = searchParams?.get("error")
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        authorization_failed: "La autorización con Wikipedia falló. Por favor, inténtalo de nuevo.",
        token_expired: "El token de autorización ha expirado. Por favor, inicia sesión nuevamente.",
        authentication_failed: "Error en la autenticación. Por favor, verifica tus credenciales.",
      }
      const errorMessage = errorMessages[errorParam] || "Error desconocido en la autenticación."
      setError(errorMessage)
      toast({
        title: "Error de autenticación",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [isAuthenticated, user, onLogin, searchParams, toast])

  const handleLogin = async () => {
    setIsLoggingIn(true)
    setError(null)

    try {
      await login()
      toast({
        title: "Redirigiendo...",
        description: "Te estamos conectando con Wikipedia",
      })
    } catch (err) {
      const errorMessage = "Error al iniciar sesión. Por favor, inténtalo de nuevo."
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setIsLoggingIn(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Administrador"
      case "community_admin":
        return "Administrador de Comunidad"
      case "community_moderator":
        return "Moderador de Comunidad"
      case "community_partner":
        return "Socio/Afiliado de Comunidad"
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-500"
      case "community_admin":
        return "bg-orange-500"
      case "community_moderator":
        return "bg-blue-500"
      case "community_partner":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Verificando autenticación...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">WikiPeopleStats</CardTitle>
                <CardDescription className="text-sm">{currentChapter}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Sistema de gestión para Wikimedia Chapters</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Conectando con Wikipedia...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-5 w-5" />
                Iniciar sesión con Wikipedia
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Información del Sistema</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-3">
            <div className="grid gap-2">
              <div className="flex items-start space-x-2">
                <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs text-gray-800">Gestión de Comunidad</p>
                  <p className="text-xs text-gray-600">Administra usuarios y permisos</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs text-gray-800">Acceso Seguro</p>
                  <p className="text-xs text-gray-600">OAuth con Wikipedia</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Globe className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs text-gray-800">Multi-Chapter</p>
                  <p className="text-xs text-gray-600">Acceso a múltiples chapters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Roles Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <h4 className="font-medium text-xs text-gray-800 text-center">Roles disponibles</h4>
            <div className="space-y-1">
              {[
                { role: "super_admin", name: "Super Administrador", description: "Acceso total" },
                { role: "community_admin", name: "Admin de Comunidad", description: "Gestión del chapter" },
                { role: "community_moderator", name: "Moderador", description: "Moderación" },
                { role: "community_partner", name: "Socio/Afiliado", description: "Visualización" },
              ].map((item) => (
                <div key={item.role} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getRoleColor(item.role)}`} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-gray-600">{item.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>Al iniciar sesión, aceptas los términos de uso del sistema</p>
            <p>
              Powered by{" "}
              <a
                href="https://www.mediawiki.org/wiki/OAuth"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                MediaWiki OAuth
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
