import { useState, useEffect } from 'react'
import { useRouter } from 'next/router' // ← importante usar 'next/router' y no 'next/navigation'

interface User {
  id: string
  name: string
  email?: string
  role: string
  chapter?: string
  wikipediaUsername: string
  avatarUrl?: string
  lastLogin?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Función para verificar autenticación
  const verifyAuth = async () => {
    try {
      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'

      const res = await fetch(`${authDomain}/api/auth/verify`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (res.ok) {
        const data = await res.json()
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

  // Llamar verifyAuth al montar y cada vez que cambia la ruta
  useEffect(() => {
    verifyAuth()

    const handleRouteChange = () => {
      verifyAuth()
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  const login = (redirectUrl?: string) => {
    const currentDomain = window.location.hostname
    const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
    window.location.href = redirectUrl || `${authDomain}/api/auth/login?origin=${encodeURIComponent(currentDomain)}`
  }

  const logout = async () => {
    try {
      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
      await fetch(`${authDomain}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    }
  }

  const hasPermission = (permission: string) => {
    if (!user) return false

    const permissions = {
      super_admin: ['all'],
      chapter_admin: ['manage_chapter', 'manage_users', 'moderate'],
      chapter_moderator: ['moderate', 'view_reports'],
      chapter_partner: ['view_stats'],
    }

    const userPermissions = permissions[user.role as keyof typeof permissions] || []
    return userPermissions.includes(permission) || userPermissions.includes('all')
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    refetch: verifyAuth,
  }
}
