// lib/security-logger.ts
import { Database } from './database'

export interface SecurityEvent {
  type: 'auth_attempt' | 'auth_success' | 'auth_failure' | 'permission_denied' | 'domain_violation' | 'suspicious_activity'
  userId?: number
  username?: string
  ip_address?: string
  user_agent?: string
  domain?: string
  endpoint?: string
  details?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class SecurityLogger {
  static async logEvent(event: SecurityEvent): Promise<void> {
    try {
      const conn = await Database.getConnection()
      
      // Crear tabla de logs de seguridad si no existe
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS security_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          user_id INT NULL,
          username VARCHAR(255) NULL,
          ip_address VARCHAR(45) NULL,
          user_agent TEXT NULL,
          domain VARCHAR(255) NULL,
          endpoint VARCHAR(255) NULL,
          details TEXT NULL,
          severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_type (type),
          INDEX idx_user_id (user_id),
          INDEX idx_severity (severity),
          INDEX idx_created_at (created_at),
          INDEX idx_domain (domain)
        )
      `)

      await conn.execute(`
        INSERT INTO security_logs (
          type, user_id, username, ip_address, user_agent, 
          domain, endpoint, details, severity, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        event.type,
        event.userId || null,
        event.username || null,
        event.ip_address || null,
        event.user_agent || null,
        event.domain || null,
        event.endpoint || null,
        event.details || null,
        event.severity
      ])

      // Log crítico también en consola
      if (event.severity === 'critical' || event.severity === 'high') {
        console.error(`🚨 SECURITY ALERT [${event.severity.toUpperCase()}]: ${event.type}`, {
          user: event.username || event.userId,
          domain: event.domain,
          endpoint: event.endpoint,
          details: event.details
        })
      }

    } catch (error) {
      console.error('❌ Error logging security event:', error)
      // En caso de error, al menos log en consola
      console.warn(`🔒 Security Event [${event.severity}]: ${event.type} - ${event.details}`)
    }
  }

  static async logDomainViolation(
    domain: string, 
    endpoint: string, 
    ip_address?: string, 
    user_agent?: string
  ): Promise<void> {
    await this.logEvent({
      type: 'domain_violation',
      domain,
      endpoint,
      ip_address,
      user_agent,
      details: `Unauthorized access attempt from domain: ${domain} to endpoint: ${endpoint}`,
      severity: 'high'
    })
  }

  static async logAuthSuccess(
    userId: number, 
    username: string, 
    domain: string, 
    ip_address?: string
  ): Promise<void> {
    await this.logEvent({
      type: 'auth_success',
      userId,
      username,
      domain,
      ip_address,
      details: `Successful authentication from domain: ${domain}`,
      severity: 'low'
    })
  }

  static async logAuthFailure(
    reason: string, 
    domain: string, 
    ip_address?: string, 
    user_agent?: string
  ): Promise<void> {
    await this.logEvent({
      type: 'auth_failure',
      domain,
      ip_address,
      user_agent,
      details: `Authentication failure: ${reason}`,
      severity: 'medium'
    })
  }

  static async logPermissionDenied(
    userId: number, 
    username: string, 
    permission: string, 
    endpoint: string
  ): Promise<void> {
    await this.logEvent({
      type: 'permission_denied',
      userId,
      username,
      endpoint,
      details: `Permission denied for ${permission} at ${endpoint}`,
      severity: 'medium'
    })
  }
}
