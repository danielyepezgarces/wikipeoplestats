import type { NextRequest } from "next/server"
import { SessionManager } from "./session-manager"

export interface AuthUser {
  id: number
  username: string
  email?: string
  avatar_url?: string
  is_claimed: boolean
  session_id: number
}

export async function validateSession(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get("auth_token")?.value
  if (!token) {
    return null
  }

  return await SessionManager.validateSession(token)
}

export async function createAuthSession(
  userId: number,
  originDomain: string,
  userAgent?: string,
  ipAddress?: string,
): Promise<{ token: string; session: any }> {
  const deviceInfo = getDeviceInfo(userAgent || "")

  return await SessionManager.createSession({
    user_id: userId,
    origin_domain: originDomain,
    user_agent: userAgent,
    ip_address: ipAddress,
    device_info: deviceInfo,
  })
}

export async function checkPermission(
  request: NextRequest,
  requiredRole?: string,
  chapterId?: number,
): Promise<{ user: AuthUser | null; hasPermission: boolean }> {
  const user = await validateSession(request)

  if (!user) {
    return { user: null, hasPermission: false }
  }

  if (!requiredRole) {
    return { user, hasPermission: true }
  }

  // Check user roles - this would need to be implemented based on your role system
  // For now, return true if user exists
  return { user, hasPermission: true }
}

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
