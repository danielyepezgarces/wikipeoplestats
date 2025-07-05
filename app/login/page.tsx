"use client"

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Users, Shield, Globe, AlertCircle } from 'lucide-react'

const WikipediaLogo = () => (
  <svg className="h-5 w-5 fill-white" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M99.98,0C44.77,0,0,44.77,0,100s44.77,100,99.98,100C155.2,200,200,155.2,200,100S155.2,0,99.98,0ZM112.2,122.7h-3.91l-8.95-20.45h-0.11l-8.84,20.45h-3.94L74.06,83.91h4.5l7.33,20.12h0.09l8.29-20.12h4.4l8.21,20.07h0.09l7.33-20.07h4.45l-13.65,38.79ZM145.2,84.03h-11.12V122.7h-4.32V84.03h-11.17V80.5h26.61v3.53Z"/>
  </svg>
)

function LoginContent() {
  const { isAuthenticated, login, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, router])

  useEffect(() => {
    const errorParam = searchParams?.get('error')
    const messageParam = searchParams?.get('message')
    const debugParam = searchParams?.get('debug')

    if (errorParam) setError(decodeURIComponent(messageParam || 'Error desconocido'))

    if (debugParam) {
      try {
        const decoded = decodeURIComponent(debugParam)
        setDebugInfo(decoded)
        console.warn('🔍 DEBUG:', JSON.parse(decoded))
      } catch (e) {
        setDebugInfo(debugParam)
      }
    }
  }, [searchParams])

  const handleLogin = () => {
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
      <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-800 dark:text-gray-200">Verificando autenticación...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  const WikipediaFAIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 512"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M640 51.2l-.3 12.2c-28.1 .8-45 15.8-55.8 40.3-25 57.8-103.3 240-155.3 358.6H415l-81.9-193.1c-32.5 63.6-68.3 130-99.2 193.1-.3 .3-15 0-15-.3C172 352.3 122.8 243.4 75.8 133.4 64.4 106.7 26.4 63.4 .2 63.7c0-3.1-.3-10-.3-14.2h161.9v13.9c-19.2 1.1-52.8 13.3-43.3 34.2 21.9 49.7 103.6 240.3 125.6 288.6 15-29.7 57.8-109.2 75.3-142.8-13.9-28.3-58.6-133.9-72.8-160-9.7-17.8-36.1-19.4-55.8-19.7V49.8l142.5 .3v13.1c-19.4 .6-38.1 7.8-29.4 26.1 18.9 40 30.6 68.1 48.1 104.7 5.6-10.8 34.7-69.4 48.1-100.8 8.9-20.6-3.9-28.6-38.6-29.4 .3-3.6 0-10.3 .3-13.6 44.4-.3 111.1-.3 123.1-.6v13.6c-22.5 .8-45.8 12.8-58.1 31.7l-59.2 122.8c6.4 16.1 63.3 142.8 69.2 156.7L559.2 91.8c-8.6-23.1-36.4-28.1-47.2-28.3V49.6l127.8 1.1 .2 .5z" />
  </svg>
)

const WikiPeopleStats = () => (
  <div className="flex items-center hover:scale-105 transition-transform">
    <a
      className="text-2xl font-bold text-blue-600 dark:text-white"
      href="/"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      WikiPeopleStats
    </a>
    <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md uppercase">
      Beta
    </span>
  </div>
)


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center">
            <WikiPeopleStats />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Accede con tu cuenta de Wikipedia</p>
        </div>

        <Card className="bg-white dark:bg-gray-800 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">WikiPeopleStats</CardTitle>
            <CardDescription className="text-center dark:text-gray-400">
              Sistema de gestión para Wikimedia Chapters
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {debugInfo && (
              <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-x-auto max-h-48">
                <strong>Debug info:</strong>
                <pre className="whitespace-pre-wrap break-all">{debugInfo}</pre>
              </div>
            )}

            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Conectando con Wikipedia...
                </>
              ) : (
                <>
                  <WikipediaFAIcon />
                  <span className="ml-2">Iniciar sesión con Wikipedia</span>
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-300 dark:border-gray-600" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">Información del Sistema</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid gap-2">
                <div className="flex items-start space-x-2">
                  <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">Gestión de Comunidad</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Administra usuarios y permisos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">Acceso Seguro</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">OAuth con Wikipedia</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Globe className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">Multi-Chapter</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Acceso a múltiples chapters</p>
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
          <p className="text-sm text-gray-600 dark:text-gray-300">
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
    <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-800 dark:text-gray-200">Cargando...</span>
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
