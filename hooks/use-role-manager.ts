// hooks/use-role-manager.ts
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'

interface UserRole {
  user_id: number
  role_id: number
  chapter_id: number
  role_name: string
  chapter_slug?: string
}

export function useRoleManager() {
  const { user, refetch: refetchAuth } = useAuth()
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refrescar roles del usuario actual
  const refreshRoles = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
      const response = await fetch(`${authDomain}/api/auth/refresh-roles`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles)
        
        // Si el token fue actualizado, refrescar la autenticación
        if (data.token_updated) {
          await refetchAuth()
        }
      } else {
        throw new Error('Failed to refresh roles')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [user, refetchAuth])

  // Asignar rol a usuario
  const assignRole = useCallback(async (
    userId: number,
    roleId: number,
    chapterId: number
  ) => {
    try {
      setLoading(true)
      setError(null)

      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
      const response = await fetch(`${authDomain}/api/admin/roles/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, roleId, chapterId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign role')
      }

      // Refrescar roles después de asignar
      await refreshRoles()
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }, [refreshRoles])

  // Remover rol de usuario
  const removeRole = useCallback(async (
    userId: number,
    roleId: number,
    chapterId: number
  ) => {
    try {
      setLoading(true)
      setError(null)

      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'
      const response = await fetch(`${authDomain}/api/admin/roles/remove`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, roleId, chapterId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove role')
      }

      // Refrescar roles después de remover
      await refreshRoles()
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }, [refreshRoles])

  // Verificar si el usuario tiene un rol específico
  const hasRole = useCallback((roleName: string, chapterId?: number) => {
    return roles.some(role => {
      const roleMatch = role.role_name === roleName
      const chapterMatch = chapterId ? role.chapter_id === chapterId : true
      return roleMatch && chapterMatch
    })
  }, [roles])

  // Verificar si puede gestionar roles
  const canManageRoles = useCallback((chapterId?: number) => {
    return hasRole('super_admin') || 
           (chapterId && hasRole('chapter_admin', chapterId))
  }, [hasRole])

  // Cargar roles iniciales
  useEffect(() => {
    if (user) {
      refreshRoles()
    }
  }, [user, refreshRoles])

  // Configurar polling para verificar cambios de roles cada 30 segundos
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      refreshRoles()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [user, refreshRoles])

  return {
    roles,
    loading,
    error,
    refreshRoles,
    assignRole,
    removeRole,
    hasRole,
    canManageRoles
  }
}