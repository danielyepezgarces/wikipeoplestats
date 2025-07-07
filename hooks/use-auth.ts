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
  roles?: Array<{
    role: string
    chapter_id: number
    chapter_slug?: string
  }>
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
  
  const hasPermission = (permission: string) => {
    if (!user) return false
    
    const permissions = {
      super_admin: ['all'],
      chapter_admin: ['manage_chapter', 'manage_users', 'moderate'],
      chapter_moderator: ['moderate', 'view_reports'],
      chapter_partner: ['view_stats']
    }
    
    const userPermissions = permissions[user.role as keyof typeof permissions] || []
    return userPermissions.includes(permission) || userPermissions.includes('all')
  }

  // Verificar si tiene un rol específico
  const hasRole = (roleName: string, chapterId?: number) => {
    if (!user?.roles) return false
    
    return user.roles.some(role => {
      const roleMatch = role.role === roleName
      const chapterMatch = chapterId ? role.chapter_id === chapterId : true
      return roleMatch && chapterMatch
    })
  }
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    hasRole,
    refetch: verifyAuth
  }
}