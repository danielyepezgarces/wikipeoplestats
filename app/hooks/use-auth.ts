"use client"

import { useState, useEffect, useCallback } from "react"

interface User {
  id: number
  username: string
  email?: string
  role?: string
  chapter?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  authenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false,
  })

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setAuthState({
            user: data.user,
            loading: false,
            authenticated: true,
          })
        } else {
          setAuthState({
            user: null,
            loading: false,
            authenticated: false,
          })
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          authenticated: false,
        })
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error)
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      })
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("❌ Logout failed:", error)
    } finally {
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      })
      // Redirigir al login
      window.location.href = "/login"
    }
  }, [])

  const refreshAuth = useCallback(() => {
    setAuthState((prev) => ({ ...prev, loading: true }))
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    ...authState,
    logout,
    refreshAuth,
    checkAuth,
  }
}
