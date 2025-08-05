import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email?: string
  role: string
  roles: string[]
  chapter?: string
  chapters: Array<{
    id: number
    name: string
    slug: string
    role: string
  }>
  wikipediaUsername: string
  avatarUrl?: string
  lastLogin?: string
}

interface ActiveContext {
  role: string
  chapterId?: number
  chapterName?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeContext, setActiveContext] = useState<ActiveContext | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    verifyAuth()
  }, [])

  // Inicializar contexto activo cuando el usuario cambia
  useEffect(() => {
    if (user && !activeContext) {
      // Determinar el contexto inicial basado en los roles del usuario
      const primaryRole = getPrimaryRole(user.roles)
      const primaryChapter = user.chapters?.[0]
      
      setActiveContext({
        role: primaryRole,
        chapterId: primaryChapter?.id,
        chapterName: primaryChapter?.name
      })
    }
  }, [user, activeContext])

  const getPrimaryRole = (roles: string[]): string => {
    // Orden de prioridad de roles
    const roleHierarchy = [
      'super_admin',
      'chapter_admin', 
      'community_admin',
      'chapter_moderator',
      'community_moderator',
      'chapter_staff',
      'chapter_partner',
      'chapter_affiliate',
      'community_partner'
    ]
    
    for (const role of roleHierarchy) {
      if (roles.includes(role)) {
        return role
      }
    }
    
    return roles[0] || 'user'
  }
  
  const verifyAuth = async () => {
    try {
      setIsLoading(true)
      
      // Intentar verificar con el dominio de auth
      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
      
      const response = await fetch(`${authDomain}/api/auth/verify`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const userData = data.user
        
        // Asegurar que roles y chapters sean arrays
        setUser({
          ...userData,
          roles: userData.roles || [userData.role],
          chapters: userData.chapters || []
        })
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
  
  const switchContext = (newContext: ActiveContext) => {
    setActiveContext(newContext)
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('activeContext', JSON.stringify(newContext))
  }
  
  const getAvailableContexts = (): ActiveContext[] => {
    if (!user) return []
    
    const contexts: ActiveContext[] = []
    
    // Si es super admin, agregar contexto global
    if (user.roles.includes('super_admin')) {
      contexts.push({
        role: 'super_admin',
        chapterId: undefined,
        chapterName: 'Global Administration'
      })
    }
    
    // Agregar contextos por chapter
    user.chapters?.forEach(chapter => {
      contexts.push({
        role: chapter.role,
        chapterId: chapter.id,
        chapterName: chapter.name
      })
    })
    
    // Si no tiene chapters específicos pero tiene roles, agregar contexto general
    if (contexts.length === 0 && user.roles.length > 0) {
      contexts.push({
        role: user.roles[0],
        chapterId: undefined,
        chapterName: 'General Access'
      })
    }
    
    return contexts
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
      setActiveContext(null)
      localStorage.removeItem('activeContext')
      router.push('/')
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    }
  }
  
  const hasPermission = (permission: string) => {
    if (!user) return false
    
    const currentRole = activeContext?.role || user.role
    
    const permissions = {
      super_admin: ['all'],
      chapter_admin: ['manage_chapter', 'manage_users', 'moderate'],
      chapter_moderator: ['moderate', 'view_reports'],
      chapter_partner: ['view_stats']
    }
    
    const userPermissions = permissions[currentRole as keyof typeof permissions] || []
    return userPermissions.includes(permission) || userPermissions.includes('all')
  }
  
  return {
    user,
    activeContext,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchContext,
    getAvailableContexts,
    hasPermission,
    refetch: verifyAuth
  }
}
