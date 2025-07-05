"use client"

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Globe, Users, Shield, BookOpen, AlertCircle } from 'lucide-react'

function LoginContent() {
  const { isAuthenticated, login, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const errorParam = searchParams?.get('error')
    const messageParam = searchParams?.get('message')
    const debugParam = searchParams?.get('debug')

    if (errorParam) {
      setError(decodeURIComponent(messageParam || 'Error desconocido'))
    }

    if (debugParam) {
      try {
        const decoded = decodeURIComponent(debugParam)
        setDebugInfo(decoded)
        console.warn('🔍 DEBUG:', JSON.parse(decoded)) // mostrar en consola también
      } catch (e) {
        setDebugInfo(debugParam)
      }
    }
  }, [searchParams])

  const handleLogin = async () => {
    setError(null)
    setDebugInfo(null)
    setIsLoggingIn(true)

    try {
      const currentDomain = window.location.hostname
      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
      login(`${authDomain}/api/auth/login?origin=${encodeURIComponent(currentDomain)}`)
    } catch (err) {
      setError("Error al iniciar sesión. Por favor, inténtalo de nuevo.")
      setIsLoggingIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center">
            <Globe className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-600">Accede con tu cuenta de Wikipedia</p>
        </div>

        <Card className="bg-white shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">WikiPeopleStats</CardTitle>
            <CardDescription className="text-center">Sistema de gestión para Wikimedia Chapters</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Debug JSON */}
            {debugInfo && (
              <div className="p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-48">
                <strong>Debug info:</strong>
                <pre className="whitespace-pre-wrap break-all">{debugInfo}</pre>
              </div>
            )}

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

            {/* Info Section */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Información del Sistema</span>
              </div>
            </div>

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

            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>Al iniciar sesión, aceptas los términos de uso del sistema</p>
              <p>
                Powered by{' '}
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

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta de Wikipedia?{' '}
            <a
              href="https://meta.wikimedia.org/wiki/Special:CreateAccount"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Crear cuenta
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  )
}
