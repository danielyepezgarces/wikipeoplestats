// lib/security-logger.ts
import { Database } from "./database"

export interface SecurityEvent {
  user_id?: number
  action: string
  details?: any
  ip_address?: string
  user_agent?: string
  severity?: "low" | "medium" | "high" | "critical"
}

export class SecurityLogger {
  static async log(event: SecurityEvent): Promise<void> {
    try {
      await Database.logSecurityEvent(event)
    } catch (error) {
      console.error("Failed to log security event:", error)
      // Don't throw error to avoid breaking the main flow
    }
  }

  static async logLoginAttempt(data: {
    user_id?: number
    username?: string
    success: boolean
    ip_address?: string
    user_agent?: string
    reason?: string
  }): Promise<void> {
    await this.log({
      user_id: data.user_id,
      action: data.success ? "login_success" : "login_failed",
      details: {
        username: data.username,
        reason: data.reason,
      },
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      severity: data.success ? "low" : "medium",
    })
  }

  static async logLogout(data: {
    user_id: number
    session_id?: number
    ip_address?: string
    user_agent?: string
    reason?: string
  }): Promise<void> {
    await this.log({
      user_id: data.user_id,
      action: "logout",
      details: {
        session_id: data.session_id,
        reason: data.reason,
      },
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      severity: "low",
    })
  }

  static async logSessionRevoked(data: {
    user_id: number
    session_id: number
    revoked_by?: number
    ip_address?: string
    user_agent?: string
    reason?: string
  }): Promise<void> {
    await this.log({
      user_id: data.user_id,
      action: "session_revoked",
      details: {
        session_id: data.session_id,
        revoked_by: data.revoked_by,
        reason: data.reason,
      },
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      severity: "medium",
    })
  }

  static async logSuspiciousActivity(data: {
    user_id?: number
    action: string
    details?: any
    ip_address?: string
    user_agent?: string
    severity?: "medium" | "high" | "critical"
  }): Promise<void> {
    await this.log({
      user_id: data.user_id,
      action: `suspicious_${data.action}`,
      details: data.details,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      severity: data.severity || "high",
    })
  }

  static async logPermissionDenied(data: {
    user_id?: number
    action: string
    resource?: string
    ip_address?: string
    user_agent?: string
  }): Promise<void> {
    await this.log({
      user_id: data.user_id,
      action: "permission_denied",
      details: {
        attempted_action: data.action,
        resource: data.resource,
      },
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      severity: "medium",
    })
  }

  static async logRoleChange(data: {
    user_id: number
    target_user_id: number
    action: "role_added" | "role_removed" | "role_updated"
    role_details: any
    ip_address?: string
    user_agent?: string
  }): Promise<void> {
    await this.log({
      user_id: data.user_id,
      action: data.action,
      details: {
        target_user_id: data.target_user_id,
        role_details: data.role_details,
      },
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      severity: "medium",
    })
  }
}
