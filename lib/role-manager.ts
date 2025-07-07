// lib/role-manager.ts
import { Database } from './database'

export interface UserRole {
  user_id: number
  role_id: number
  chapter_id: number
  role_name: string
  chapter_slug?: string
}

export interface RoleChangeEvent {
  type: 'role_added' | 'role_removed' | 'role_updated'
  user_id: number
  role: UserRole
  timestamp: string
  changed_by: number
}

export class RoleManager {
  // Obtener todos los roles de un usuario directamente de la DB
  static async getUserRoles(userId: number): Promise<UserRole[]> {
    const conn = await Database.getConnection()
    const [rows] = await conn.execute(`
      SELECT 
        ur.user_id,
        ur.role_id,
        ur.chapter_id,
        r.name as role_name,
        c.slug as chapter_slug
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      JOIN chapters c ON ur.chapter_id = c.id
      WHERE ur.user_id = ? AND r.is_active = 1
    `, [userId])
    
    return rows as UserRole[]
  }

  // Verificar si un usuario tiene un rol específico (SOLO SERVER-SIDE)
  static async hasRole(userId: number, roleName: string, chapterId?: number): Promise<boolean> {
    const conn = await Database.getConnection()
    let query = `
      SELECT COUNT(*) as count
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ? AND r.name = ? AND r.is_active = 1
    `
    const params: any[] = [userId, roleName]

    if (chapterId) {
      query += ' AND ur.chapter_id = ?'
      params.push(chapterId)
    }

    const [rows] = await conn.execute(query, params)
    const result = rows as { count: number }[]
    return result[0].count > 0
  }

  // Verificar múltiples permisos de una vez
  static async hasAnyRole(userId: number, roleNames: string[], chapterId?: number): Promise<boolean> {
    const conn = await Database.getConnection()
    const placeholders = roleNames.map(() => '?').join(',')
    let query = `
      SELECT COUNT(*) as count
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ? AND r.name IN (${placeholders}) AND r.is_active = 1
    `
    const params: any[] = [userId, ...roleNames]

    if (chapterId) {
      query += ' AND ur.chapter_id = ?'
      params.push(chapterId)
    }

    const [rows] = await conn.execute(query, params)
    const result = rows as { count: number }[]
    return result[0].count > 0
  }

  // Asignar rol a usuario
  static async assignRole(
    userId: number, 
    roleId: number, 
    chapterId: number, 
    assignedBy: number
  ): Promise<void> {
    const conn = await Database.getConnection()
    
    // Verificar que el usuario que asigna tiene permisos
    const canAssign = await this.canManageRoles(assignedBy, chapterId)
    if (!canAssign) {
      throw new Error('Insufficient permissions to assign roles')
    }

    // Verificar que el rol no existe ya
    const [existing] = await conn.execute(
      'SELECT COUNT(*) as count FROM user_roles WHERE user_id = ? AND role_id = ? AND chapter_id = ?',
      [userId, roleId, chapterId]
    )
    const existingResult = existing as { count: number }[]
    
    if (existingResult[0].count > 0) {
      throw new Error('User already has this role in this chapter')
    }

    // Asignar el rol
    await conn.execute(
      'INSERT INTO user_roles (user_id, role_id, chapter_id) VALUES (?, ?, ?)',
      [userId, roleId, chapterId]
    )

    // Registrar el cambio
    await this.logRoleChange('role_added', userId, roleId, chapterId, assignedBy)
  }

  // Remover rol de usuario
  static async removeRole(
    userId: number, 
    roleId: number, 
    chapterId: number, 
    removedBy: number
  ): Promise<void> {
    const conn = await Database.getConnection()
    
    // Verificar permisos
    const canRemove = await this.canManageRoles(removedBy, chapterId)
    if (!canRemove) {
      throw new Error('Insufficient permissions to remove roles')
    }

    // Remover el rol
    await conn.execute(
      'DELETE FROM user_roles WHERE user_id = ? AND role_id = ? AND chapter_id = ?',
      [userId, roleId, chapterId]
    )

    // Registrar el cambio
    await this.logRoleChange('role_removed', userId, roleId, chapterId, removedBy)
  }

  // Verificar si un usuario puede gestionar roles
  static async canManageRoles(userId: number, chapterId: number): Promise<boolean> {
    // Super admin puede gestionar cualquier cosa
    if (await this.hasRole(userId, 'super_admin')) {
      return true
    }

    // Chapter admin puede gestionar roles en su chapter
    if (await this.hasRole(userId, 'chapter_admin', chapterId)) {
      return true
    }

    return false
  }

  // Verificar si puede ver estadísticas
  static async canViewStats(userId: number, chapterId?: number): Promise<boolean> {
    return await this.hasAnyRole(userId, [
      'super_admin',
      'chapter_admin', 
      'chapter_moderator',
      'chapter_staff',
      'chapter_partner'
    ], chapterId)
  }

  // Verificar si puede moderar
  static async canModerate(userId: number, chapterId?: number): Promise<boolean> {
    return await this.hasAnyRole(userId, [
      'super_admin',
      'chapter_admin',
      'chapter_moderator'
    ], chapterId)
  }

  // Obtener información completa del usuario con roles (para respuestas de API)
  static async getUserWithRoles(userId: number): Promise<any> {
    const user = await Database.getUserById(userId)
    if (!user) return null

    const roles = await this.getUserRoles(userId)
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: roles.map(r => ({
        role: r.role_name,
        chapter_id: r.chapter_id,
        chapter_slug: r.chapter_slug
      })),
      permissions: {
        canManageUsers: await this.hasAnyRole(userId, ['super_admin', 'chapter_admin']),
        canModerate: await this.canModerate(userId),
        canViewStats: await this.canViewStats(userId),
        isSuperAdmin: await this.hasRole(userId, 'super_admin')
      }
    }
  }

  // Registrar cambios de roles para auditoría
  private static async logRoleChange(
    type: string,
    userId: number,
    roleId: number,
    chapterId: number,
    changedBy: number
  ): Promise<void> {
    const conn = await Database.getConnection()
    
    // Crear tabla de logs si no existe
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS role_change_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        chapter_id INT NOT NULL,
        changed_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_changed_by (changed_by),
        INDEX idx_created_at (created_at)
      )
    `)

    await conn.execute(`
      INSERT INTO role_change_log (type, user_id, role_id, chapter_id, changed_by, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [type, userId, roleId, chapterId, changedBy])
  }

  // Middleware para verificar permisos en rutas de API
  static async requireRole(userId: number, requiredRole: string, chapterId?: number): Promise<boolean> {
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const hasPermission = await this.hasRole(userId, requiredRole, chapterId)
    if (!hasPermission) {
      throw new Error(`Insufficient permissions. Required role: ${requiredRole}`)
    }

    return true
  }

  // Middleware para verificar cualquiera de varios roles
  static async requireAnyRole(userId: number, requiredRoles: string[], chapterId?: number): Promise<boolean> {
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const hasPermission = await this.hasAnyRole(userId, requiredRoles, chapterId)
    if (!hasPermission) {
      throw new Error(`Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`)
    }

    return true
  }
}