import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "./session-manager"

export interface AuthUser {
  id: number
  username: string
  email?: string
  avatar_url?: string
  is_claimed: boolean
  session_id: number
}

export interface AuthContext {
  user: AuthUser
  session_id: number
}

export interface AuthRequest extends NextRequest {
  user?: AuthUser
}

// Get user from session token
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const userSession = await SessionManager.validateSession(token)
    if (!userSession) {
      return null
    }

    return {
      id: userSession.id,
      username: userSession.username,
      email: userSession.email,
      avatar_url: userSession.avatar_url,
      is_claimed: userSession.is_claimed,
      session_id: userSession.session_id,
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

    const user = await getUserFromToken(token)
    if (!user) {
      return null
    }

    return {
      user,
      session_id: user.session_id,
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
    throw new Error("Invalid session")
  }

  return { userId: user.id, user }
}

// Require any of the specified roles
export async function requireAnyRole(request: NextRequest, roles: string[]): Promise<{ user: AuthUser }> {
  const { user } = await requireAuth(request)

  // For now, implement basic role checking
  // You can enhance this with actual role queries from the database
  const userRoles = ["user"] // Default role - enhance with actual roles later
  const hasRole = roles.some((role) => userRoles.includes(role)) || userRoles.includes("super_admin")

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

  // For now, implement basic permission checking
  // You can enhance this with actual permission queries from the database
  const hasPermission = false // Implement actual permission logic here

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

// Create session and set cookie
export async function createAuthSession(
  userId: number,
  origin: string,
  userAgent?: string,
  ipAddress?: string,
): Promise<{ token: string; user: AuthUser }> {
  const deviceInfo = getDeviceInfo(userAgent || "")

  const { token } = await SessionManager.createSession({
    user_id: userId,
    origin_domain: origin,
    user_agent: userAgent,
    ip_address: ipAddress,
    device_info: deviceInfo,
  })

  const user = await getUserFromToken(token)
  if (!user) {
    throw new Error("Failed to create session")
  }

  return { token, user }
}

// Helper function to get device info
function getDeviceInfo(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  let device = "Desktop"
  let browser = "Unknown"
  let os = "Unknown"

  // Detect device
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    device = "Mobile"
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    device = "Tablet"
  }

  // Detect browser
  if (ua.includes("chrome")) browser = "Chrome"
  else if (ua.includes("firefox")) browser = "Firefox"
  else if (ua.includes("safari")) browser = "Safari"
  else if (ua.includes("edge")) browser = "Edge"

  // Detect OS
  if (ua.includes("windows")) os = "Windows"
  else if (ua.includes("mac")) os = "macOS"
  else if (ua.includes("linux")) os = "Linux"
  else if (ua.includes("android")) os = "Android"
  else if (ua.includes("ios")) os = "iOS"

  return `${device} - ${browser} on ${os}`
}
