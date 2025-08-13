import { type NextRequest, NextResponse } from "next/server"
import { JWTManager } from "./jwt"
import { Database } from "./database"

export interface AuthUser {
  id: number
  username: string
  email?: string
  roles: string[]
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = JWTManager.verifyToken(token)
    if (!decoded) {
      return null
    }

    // Check if token is blacklisted
    const isBlacklisted = await Database.isTokenBlacklisted(token)
    if (isBlacklisted) {
      return null
    }

    // Get user from database to ensure they still exist and are active
    const user = await Database.getUserById(decoded.userId)
    if (!user || !user.is_active) {
      return null
    }

    // Update session last used time
    const tokenHash = JWTManager.hashToken(token)
    const session = await Database.getSessionByTokenHash(tokenHash)
    if (session) {
      await Database.updateSessionLastUsed(session.id)
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: [], // This would be populated from user roles query
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return null
  }
}

export function createAuthResponse(user: AuthUser | null, response?: NextResponse): NextResponse {
  const res = response || NextResponse.json({ user })

  if (!user) {
    // Clear auth cookie if user is not authenticated
    res.cookies.delete("auth_token")
  }

  return res
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await verifyAuth(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireAnyRole(request: NextRequest, roles: string[], chapterId?: number): Promise<AuthUser> {
  const user = await requireAuth(request)

  // For now, return the user - role checking logic would go here
  // This is a placeholder implementation
  return user
}

export async function checkPermission(
  request: NextRequest,
  permission: string,
  chapterId?: number,
): Promise<{ auth: AuthUser; hasPermission: boolean }> {
  const auth = await requireAuth(request)

  // For now, return true for all permissions - actual permission logic would go here
  // This is a placeholder implementation
  const hasPermission = true

  return { auth, hasPermission }
}