import { cookies } from "next/headers"
import { SessionManager } from "./session-manager"
import { Database } from "./database"

export interface User {
  id: number
  username: string
  email?: string
  wikimedia_id?: string
  avatar_url?: string
  is_claimed: boolean
  roles: string[]
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return null
    }

    const session = await SessionManager.getSession(sessionId)
    if (!session) {
      return null
    }

    const user = await Database.getUserById(session.userId)
    if (!user) {
      return null
    }

    const roles = await Database.getUserRoles(user.id)

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      wikimedia_id: user.wikimedia_id,
      avatar_url: user.avatar_url,
      is_claimed: user.is_claimed,
      roles,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Super admin tiene todos los permisos
  if (user.roles.includes("super_admin")) return true

  // Mapear permisos específicos
  const permissionMap: Record<string, string[]> = {
    "admin.users.read": ["admin", "super_admin"],
    "admin.users.write": ["admin", "super_admin"],
    "admin.chapters.read": ["admin", "super_admin", "moderator"],
    "admin.chapters.write": ["admin", "super_admin"],
    "moderator.chapters.read": ["moderator", "admin", "super_admin"],
    "moderator.chapters.write": ["moderator", "admin", "super_admin"],
  }

  const requiredRoles = permissionMap[permission] || []
  return user.roles.some((role) => requiredRoles.includes(role))
}

export async function requirePermission(permission: string): Promise<User> {
  const user = await requireAuth()
  const hasAccess = await hasPermission(permission)

  if (!hasAccess) {
    throw new Error(`Permission denied: ${permission}`)
  }

  return user
}
