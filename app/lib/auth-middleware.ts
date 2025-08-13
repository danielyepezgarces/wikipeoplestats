import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./jwt"
import { Database } from "./database"

export interface AuthUser {
  id: number
  username: string
  email?: string
  roles: string[]
  permissions: string[]
}

export interface AuthRequest extends NextRequest {
  user?: AuthUser
}

// Get user from token
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const payload = verifyToken(token)
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

// Require authentication
export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  return { user }
}

// Require any of the specified roles
export async function requireAnyRole(
  request: NextRequest,
  roles: string[],
): Promise<{ user: AuthUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult
  const hasRole = roles.some((role) => user.roles.includes(role)) || user.roles.includes("super_admin")

  if (!hasRole) {
    return NextResponse.json(
      {
        error: "Insufficient permissions",
        required_roles: roles,
        user_roles: user.roles,
      },
      { status: 403 },
    )
  }

  return { user }
}

// Check specific permission
export async function checkPermission(
  request: NextRequest,
  permission: string,
): Promise<{ user: AuthUser; hasPermission: boolean } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult
  const hasPermission = user.permissions.includes(permission) || user.roles.includes("super_admin")

  return { user, hasPermission }
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
