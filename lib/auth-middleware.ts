import { type NextRequest, NextResponse } from "next/server"
import { JWTManager } from "./jwt"
import { Database } from "./database"

export interface AuthUser {
  id: number
  username: string
  email?: string
  roles: string[]
  permissions: string[]
}

export interface AuthContext {
  userId: number
  username: string
  sessionId: number
  roles: string[]
  permissions: string[]
}

export interface AuthRequest extends NextRequest {
  user?: AuthUser
}

// Get user from token
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const payload = JWTManager.verifyToken(token)
    if (!payload || typeof payload === "string") {
      return null
    }

    // Get user from database
    const user = await Database.getUserById(payload.userId)
    if (!user || !user.is_active) {
      return null
    }

    // For now, return basic user info with empty roles/permissions
    // You can enhance this later with actual role/permission queries
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: ["user"], // Default role
      permissions: [],
    }
  } catch (error) {
    console.error("Error getting user from token:", error)
    return null
  }
}

// Get auth context from request
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) {
      return null
    }

    const decoded = JWTManager.verifyToken(token)
    if (!decoded) {
      return null
    }

    const user = await Database.getUserById(decoded.userId)
    if (!user || !user.is_active) {
      return null
    }

    // Get session info
    const tokenHash = JWTManager.hashToken(token)
    const session = await Database.getSessionByTokenHash(tokenHash)
    if (!session || !session.is_active) {
      return null
    }

    return {
      userId: user.id,
      username: user.username,
      sessionId: session.id,
      roles: ["user"], // Default role - enhance with actual roles later
      permissions: [],
    }
  } catch (error) {
    console.error("Error getting auth context:", error)
    return null
  }
}

// Require authentication
export async function requireAuth(request: NextRequest): Promise<{ userId: number; user: AuthUser }> {
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    throw new Error("Authentication required")
  }

  const user = await getUserFromToken(token)
  if (!user) {
    throw new Error("Invalid token")
  }

  return { userId: user.id, user }
}

// Require any of the specified roles
export async function requireAnyRole(request: NextRequest, roles: string[]): Promise<{ user: AuthUser }> {
  const { user } = await requireAuth(request)

  const hasRole = roles.some((role) => user.roles.includes(role)) || user.roles.includes("super_admin")

  if (!hasRole) {
    throw new Error("Insufficient permissions")
  }

  return { user }
}

// Check specific permission
export async function checkPermission(
  request: NextRequest,
  permission: string,
  chapterId?: number,
): Promise<{ auth: AuthContext; hasPermission: boolean }> {
  const auth = await getAuthContext(request)

  if (!auth) {
    throw new Error("Authentication required")
  }

  // For now, super admins have all permissions
  const hasPermission = auth.roles.includes("super_admin") || auth.permissions.includes(permission)

  return { auth, hasPermission }
}

// Get current user without requiring auth (returns null if not authenticated)
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    return null
  }

  return getUserFromToken(token)
}

// Verify auth for client-side use
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  return getCurrentUser(request)
}

export function createAuthResponse(user: AuthUser | null, response?: NextResponse): NextResponse {
  const res = response || NextResponse.json({ user })

  if (!user) {
    // Clear auth cookie if user is not authenticated
    res.cookies.delete("auth_token")
  }

  return res
}
