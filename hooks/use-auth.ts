"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

interface UserRole {
  id: string
  name: string
  i18n_key: string
  chapter_id?: string
  chapter_name?: string
}

interface User {
  id: string
  username: string
  email?: string
  roles: UserRole[]
  wikimedia_id: string
  avatar_url?: string
  last_login?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)

  const refreshToken = useCallback(async () => {
    if (isRefreshingRef.current) return false

    try {
      isRefreshingRef.current = true
      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.wikipeoplestats.org"

      const response = await fetch(`${authDomain}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("🔄 Token refreshed successfully")

        // Verify auth after refresh to get updated user data
        await verifyAuth()
        return true
      } else {
        console.log("❌ Token refresh failed:", response.status)
        setUser(null)
        return false
      }
    } catch (error) {
      console.error("Error refreshing token:", error)
      setUser(null)
      return false
    } finally {
      isRefreshingRef.current = false
    }
  }, [])

  const setupAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Refresh token every 14 minutes (before 15-minute expiry)
    refreshIntervalRef.current = setInterval(
      async () => {
        if (user) {
          console.log("🔄 Auto-refreshing token...")
          const success = await refreshToken()
          if (!success) {
            console.log("❌ Auto-refresh failed, redirecting to login")
            router.push("/")
          }
        }
      },
      14 * 60 * 1000,
    ) // 14 minutes
  }, [user, refreshToken, router])

  const verifyAuth = async () => {
    try {
      setIsLoading(true)

      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.wikipeoplestats.org"

      const response = await fetch(`${authDomain}/api/auth/verify`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        if (data.user) {
          setupAutoRefresh()
        }
      } else if (response.status === 401) {
        // Try to refresh token if verification fails
        console.log("🔄 Access token expired, attempting refresh...")
        const refreshSuccess = await refreshToken()
        if (!refreshSuccess) {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    verifyAuth()
  }, [])

  const login = (redirectUrl?: string) => {
    const currentDomain = window.location.hostname
    const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.wikipeoplestats.org"

    if (redirectUrl) {
      window.location.href = redirectUrl
    } else {
      window.location.href = `${authDomain}/api/auth/login?origin=${encodeURIComponent(currentDomain)}`
    }
  }

  const logout = async () => {
    try {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }

      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.wikipeoplestats.org"

      await fetch(`${authDomain}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Error cerrando sesión:", error)
    }
  }

  const hasPermission = (permission: string, chapterId?: string) => {
    if (!user || !user.roles) return false

    const permissions = {
      super_admin: ["all"],
      chapter_admin: ["manage_chapter", "manage_users", "moderate", "view_stats"],
      chapter_moderator: ["moderate", "view_reports", "view_stats"],
      chapter_partner: ["view_stats"],
    }

    // Check if user has super_admin role (global permissions)
    const hasSuperAdmin = user.roles.some((role) => role.name === "super_admin")
    if (hasSuperAdmin) return true

    // Check chapter-specific permissions
    const relevantRoles = chapterId ? user.roles.filter((role) => role.chapter_id === chapterId) : user.roles

    return relevantRoles.some((role) => {
      const rolePermissions = permissions[role.name as keyof typeof permissions] || []
      return rolePermissions.includes(permission) || rolePermissions.includes("all")
    })
  }

  const getHighestRole = () => {
    if (!user || !user.roles || user.roles.length === 0) return null

    const roleHierarchy = ["super_admin", "chapter_admin", "chapter_moderator", "chapter_partner"]

    for (const roleName of roleHierarchy) {
      if (user.roles.some((role) => role.name === roleName)) {
        return roleName
      }
    }

    return user.roles[0]?.name || null
  }

  const getDashboardUrl = () => {
    const highestRole = getHighestRole()

    switch (highestRole) {
      case "super_admin":
        return "/dashboard/super-admin"
      case "chapter_admin":
        return "/dashboard/chapter-admin"
      case "chapter_moderator":
        return "/dashboard/moderator"
      case "chapter_partner":
        return "/dashboard/partner"
      default:
        return "/dashboard"
    }
  }

  const getUserChapters = () => {
    if (!user || !user.roles) return []

    const chapters = user.roles
      .filter((role) => role.chapter_id && role.chapter_name)
      .map((role) => ({
        id: role.chapter_id!,
        name: role.chapter_name!,
      }))

    // Remove duplicates
    return chapters.filter((chapter, index, self) => index === self.findIndex((c) => c.id === chapter.id))
  }

  const hasRoleInChapter = (roleName: string, chapterId?: string) => {
    if (!user || !user.roles) return false

    if (chapterId) {
      return user.roles.some((role) => role.name === roleName && role.chapter_id === chapterId)
    }

    return user.roles.some((role) => role.name === roleName)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    getHighestRole,
    getDashboardUrl,
    getUserChapters,
    hasRoleInChapter,
    refetch: verifyAuth,
    refreshToken, // Expose manual refresh function
  }
}
