"use client"

import { useState, useEffect } from "react"

interface User {
  id: number
  username: string
  email?: string
  is_claimed: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setAuthState({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })

      // Redirigir al login
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const refreshAuth = () => {
    checkAuth()
  }

  return {
    ...authState,
    logout,
    refreshAuth,
  }
}
