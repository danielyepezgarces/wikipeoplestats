import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./jwt"
import { getDatabase } from "./database"
import type { RowDataPacket } from "mysql2"

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

    const db = await getDatabase()

    // Get user with roles
    const [userRows] = await db.execute<RowDataPacket[]>(
      `SELECT u.id, u.username, u.email, 
              GROUP_CONCAT(DISTINCT r.name) as roles,
              GROUP_CONCAT(DISTINCT p.name) as permissions
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [payload.userId],
    )

    if (userRows.length === 0) {
      return null
    }

    const user = userRows[0]
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles ? user.roles.split(",") : [],
      permissions: user.permissions ? user.permissions.split(",") : [],
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
  const hasRole = roles.some((role) => user.roles.includes(role))

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

// Require all specified roles
export async function requireAllRoles(
  request: NextRequest,
  roles: string[],
): Promise<{ user: AuthUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult
  const hasAllRoles = roles.every((role) => user.roles.includes(role))

  if (!hasAllRoles) {
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

// Require specific permission
export async function requirePermission(
  request: NextRequest,
  permission: string,
): Promise<{ user: AuthUser } | NextResponse> {
  const permissionResult = await checkPermission(request, permission)

  if (permissionResult instanceof NextResponse) {
    return permissionResult
  }

  const { user, hasPermission } = permissionResult

  if (!hasPermission) {
    return NextResponse.json(
      {
        error: "Insufficient permissions",
        required_permission: permission,
        user_permissions: user.permissions,
      },
      { status: 403 },
    )
  }

  return { user }
}

// Check if user is super admin
export async function requireSuperAdmin(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  return requireAnyRole(request, ["super_admin"])
}

// Check if user is admin (super_admin or admin)
export async function requireAdmin(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  return requireAnyRole(request, ["super_admin", "admin"])
}

// Check if user is moderator or higher
export async function requireModerator(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  return requireAnyRole(request, ["super_admin", "admin", "moderator"])
}

// Middleware wrapper for API routes
export function withAuth(handler: (request: AuthRequest, user: AuthUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await requireAuth(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult
    const authRequest = request as AuthRequest
    authRequest.user = user

    return handler(authRequest, user)
  }
}

// Middleware wrapper with role requirement
export function withRole(roles: string[], handler: (request: AuthRequest, user: AuthUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await requireAnyRole(request, roles)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult
    const authRequest = request as AuthRequest
    authRequest.user = user

    return handler(authRequest, user)
  }
}

// Middleware wrapper with permission requirement
export function withPermission(
  permission: string,
  handler: (request: AuthRequest, user: AuthUser) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    const authResult = await requirePermission(request, permission)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult
    const authRequest = request as AuthRequest
    authRequest.user = user

    return handler(authRequest, user)
  }
}

// Get current user without requiring auth (returns null if not authenticated)
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    return null
  }

  return getUserFromToken(token)
}

// Check if user has specific role
export function hasRole(user: AuthUser, role: string): boolean {
  return user.roles.includes(role) || user.roles.includes("super_admin")
}

// Check if user has any of the specified roles
export function hasAnyRole(user: AuthUser, roles: string[]): boolean {
  return roles.some((role) => hasRole(user, role))
}

// Check if user has all specified roles
export function hasAllRoles(user: AuthUser, roles: string[]): boolean {
  return roles.every((role) => hasRole(user, role))
}

// Check if user has specific permission
export function hasPermission(user: AuthUser, permission: string): boolean {
  return user.permissions.includes(permission) || user.roles.includes("super_admin")
}

// Check if user has any of the specified permissions
export function hasAnyPermission(user: AuthUser, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission))
}

// Check if user has all specified permissions
export function hasAllPermissions(user: AuthUser, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(user, permission))
}
