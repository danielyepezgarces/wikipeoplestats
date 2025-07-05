"use client"

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { isAuthenticated, login, isLoading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Manejar errores de autenticación usando URLSearchParams del lado del cliente
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const errorParam = urlParams.get('error')
      if (errorParam) {
        const errorMessages = {
          'authorization_failed': 'Falló la autorización con Wikipedia',
          'token_expired': 'El token de autenticación ha expirado',
          'authentication_failed': 'Error en la autenticación',
          'access_denied': 'Acceso denegado por el usuario'
        }
        setError(errorMessages[errorParam as keyof typeof errorMessages] || 'Error desconocido')
        
        // Limpiar el parámetro de error de la URL
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  const handleLogin = () => {
    setError(null)
    login()
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accede con tu cuenta de Wikipedia
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">
                Para acceder a WikiPeopleStats, necesitas autenticarte con tu cuenta de Wikipedia. 
                Esto nos permite verificar tu identidad y roles en la comunidad.
              </p>
              
              <button
                onClick={handleLogin}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 1.5c-4.687 0-8.5 3.813-8.5 8.5s3.813 8.5 8.5 8.5 8.5-3.813 8.5-8.5-3.813-8.5-8.5-8.5zm0 1c4.136 0 7.5 3.364 7.5 7.5s-3.364 7.5-7.5 7.5-7.5-3.364-7.5-7.5 3.364-7.5 7.5-7.5z"/>
                </svg>
                Continuar con Wikipedia
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Al iniciar sesión, aceptas los términos de servicio y la política de privacidad
              </p>
            </div>
          </div>
        </div>
        
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