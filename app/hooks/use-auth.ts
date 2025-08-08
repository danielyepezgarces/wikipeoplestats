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
      console.log('Starting auth verification...')
      
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
        console.log('Auth verification successful:', userData)
        
        // Asegurar que roles y chapters sean arrays
        const normalizedUser = {
          ...userData,
          roles: userData.roles || [userData.role],
          chapters: userData.chapters || []
        }
        
        setUser(normalizedUser)
        
        // Inicializar contexto activo inmediatamente
        console.log('Initializing context for normalized user:', normalizedUser)
        initializeActiveContext(normalizedUser)
      } else {
        console.log('Auth verification failed:', response.status)
        setUser(null)
        setActiveContext(null)
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      setUser(null)
      setActiveContext(null)
    } finally {
      console.log('Auth verification completed')
      setIsLoading(false)
    }
  }

  const initializeActiveContext = (userData: User) => {
    console.log('Initializing active context for user:', userData)
    
    // Intentar restaurar desde localStorage
    const savedContext = localStorage.getItem('activeContext')
    if (savedContext) {
      try {
        const parsed = JSON.parse(savedContext)
        console.log('Found saved context:', parsed)
        // Verificar que el contexto guardado sigue siendo válido
        if (isValidContext(parsed, userData)) {
          console.log('Saved context is valid, using it')
          setActiveContext(parsed)
          return
        } else {
          console.log('Saved context is invalid, creating new one')
        }
      } catch (error) {
        console.error('Error parsing saved context:', error)
      }
    }

    // Si no hay contexto guardado válido, crear uno por defecto
    const primaryRole = getPrimaryRole(userData.roles)
    const primaryChapter = userData.chapters?.[0]
    
    const defaultContext: ActiveContext = {
      role: primaryRole,
      chapterId: primaryChapter?.id,
      chapterName: primaryChapter?.name || (primaryRole === 'super_admin' ? 'Global Administration' : 'General Access')
    }
    
    console.log('Setting default context:', defaultContext)
    setActiveContext(defaultContext)
    localStorage.setItem('activeContext', JSON.stringify(defaultContext))
  }

  const isValidContext = (context: ActiveContext, userData: User): boolean => {
    // Verificar que el rol existe en los roles del usuario
    if (!userData.roles.includes(context.role)) {
      return false
    }
    
    // Si tiene chapterId, verificar que el usuario tiene acceso a ese chapter
    if (context.chapterId) {
      return userData.chapters.some(chapter => chapter.id === context.chapterId)
    }
    
    return true
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
      const primaryRole = getPrimaryRole(user.roles)
      contexts.push({
        role: primaryRole,
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
    if (!user || !activeContext) return false
    
    const currentRole = activeContext.role
    
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