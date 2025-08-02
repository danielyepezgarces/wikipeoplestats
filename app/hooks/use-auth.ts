"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  username: string
  email?: string
  roles?: string[]
}

interface Session {
  id: string
  createdAt: string
  expiresAt: string
  lastActivity: string
  deviceInfo?: string
  origin?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    verifyAuth()
  }, [])

  const verifyAuth = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/auth/verify", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setSession(data.session)
      } else {
        setUser(null)
        setSession(null)
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error)
      setUser(null)
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = () => {
    window.location.href = "/api/auth/login"
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      setUser(null)
      setSession(null)
      router.push("/")
    } catch (error) {
      console.error("Error cerrando sesión:", error)
    }
  }

  const hasRole = (role: string) => {
    if (!user || !user.roles) return false
    return user.roles.includes(role)
  }

  const hasPermission = (permission: string) => {
    if (!user) return false

    const permissions = {
      super_admin: ["all"],
      chapter_admin: ["manage_chapter", "manage_users", "moderate"],
      chapter_moderator: ["moderate", "view_reports"],
      chapter_partner: ["view_stats"],
    }

    const userRoles = user.roles || []
    for (const role of userRoles) {
      const rolePermissions = permissions[role as keyof typeof permissions] || []
      if (rolePermissions.includes(permission) || rolePermissions.includes("all")) {
        return true
      }
    }

    return false
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    hasPermission,
    refetch: verifyAuth,
  }
}
