import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email?: string
  lastLogin?: string
  // NO incluimos roles aquí - se verifican solo en servidor
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    verifyAuth()
  }, [])
  
  const verifyAuth = async () => {
    try {
      setIsLoading(true)
      
      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
      
      const response = await fetch(`${authDomain}/api/auth/verify`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }
  
  const login = (redirectUrl?: string) => {
    const currentDomain = window.location.hostname
    const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
    
    if (redirectUrl) {
      window.location.href = redirectUrl
    } else {
      window.location.href = `${authDomain}/api/auth/login?origin=${encodeURIComponent(currentDomain)}`
    }
  }
  
  const logout = async () => {
    try {
      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
      
      await fetch(`${authDomain}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    }
  }

  // Verificar permisos haciendo llamada al servidor
  const checkPermission = async (permission: string, chapterId?: number): Promise<boolean> => {
    if (!user) return false

    try {
      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
      const url = new URL(`${authDomain}/api/auth/check-permission`)
      url.searchParams.set('permission', permission)
      if (chapterId) {
        url.searchParams.set('chapterId', chapterId.toString())
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.hasPermission
      }
      
      return false
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkPermission, // Reemplaza hasPermission y hasRole
    refetch: verifyAuth
  }
}