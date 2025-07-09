// hooks/use-role-manager.ts
import { useState, useEffect } from 'react'

interface UserRole {
  user_id: number
  role_id: number
  chapter_id: number
  role_name: string
  chapter_slug?: string
}

export function useRoleManager() {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshRoles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // This would typically fetch from your API
      // For now, we'll simulate with empty data
      setRoles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  const assignRole = async (userId: number, roleId: number, chapterId: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/roles/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, roleId, chapterId }),
      })

      if (response.ok) {
        await refreshRoles()
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to assign role')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign role')
      return false
    }
  }

  const removeRole = async (userId: number, roleId: number, chapterId: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/roles/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, roleId, chapterId }),
      })

      if (response.ok) {
        await refreshRoles()
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to remove role')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove role')
      return false
    }
  }

  const canManageRoles = (chapterId: number): boolean => {
    // This would check if the current user can manage roles for the given chapter
    // For now, we'll return true as a placeholder
    return true
  }

  useEffect(() => {
    refreshRoles()
  }, [])

  return {
    roles,
    loading,
    error,
    refreshRoles,
    assignRole,
    removeRole,
    canManageRoles
  }
}