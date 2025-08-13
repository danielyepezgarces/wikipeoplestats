"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    verifyAuth()
  }, [])

  const verifyAuth = async () => {
    try {
      setIsLoading(true)

      // Intentar verificar con el dominio de auth
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
        return "/admin"
      case "chapter_admin":
        return "/chapter-admin"
      case "chapter_moderator":
        return "/moderator"
      case "chapter_partner":
        return "/partner"
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
  }
}
