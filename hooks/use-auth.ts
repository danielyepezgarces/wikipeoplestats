// hooks/use-auth.ts
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  
  useEffect(() => {
    verifyAuth()
  }, [])
  
  const verifyAuth = async () => {
    try {
      const response = await fetch(`https://${process.env.NEXT_PUBLIC_AUTH_DOMAIN}/api/auth/verify`, {
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
  
  const login = () => {
    const currentDomain = window.location.hostname
    window.location.href = `https://${process.env.AUTH_DOMAIN}/api/auth/login?origin=${currentDomain}`
  }
  
  const logout = async () => {
    try {
      await fetch(`https://${process.env.AUTH_DOMAIN}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
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
      community_admin: ['manage_chapter', 'manage_users', 'moderate'],
      community_moderator: ['moderate', 'view_reports'],
      community_partner: ['view_stats']
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
    refetch: verifyAuth
  }
}