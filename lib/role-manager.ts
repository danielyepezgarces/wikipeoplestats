// lib/role-manager.ts
import { Database } from './database'
import jwt from 'jsonwebtoken'

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
  private static JWT_SECRET = process.env.JWT_SECRET!

  // Obtener todos los roles de un usuario
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

  // Verificar si un usuario tiene un rol específico
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
    
    // Invalidar sesiones del usuario para forzar actualización de permisos
    await this.invalidateUserSessions(userId)
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
    const [result] = await conn.execute(
      'DELETE FROM user_roles WHERE user_id = ? AND role_id = ? AND chapter_id = ?',
      [userId, roleId, chapterId]
    )

    // Registrar el cambio
    await this.logRoleChange('role_removed', userId, roleId, chapterId, removedBy)
    
    // Invalidar sesiones
    await this.invalidateUserSessions(userId)
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

  // Generar nuevo token JWT con roles actualizados
  static async generateUpdatedToken(userId: number): Promise<string> {
    const user = await Database.getUserById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const roles = await this.getUserRoles(userId)
    
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: roles.map(r => ({
        role: r.role_name,
        chapter_id: r.chapter_id,
        chapter_slug: r.chapter_slug
      })),
      updated_at: new Date().toISOString()
    }

    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: '30d' })
  }

  // Invalidar sesiones de usuario para forzar re-autenticación
  private static async invalidateUserSessions(userId: number): Promise<void> {
    const conn = await Database.getConnection()
    await conn.execute(
      'UPDATE sessions SET expires_at = NOW() WHERE user_id = ?',
      [userId]
    )
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
    await conn.execute(`
      INSERT INTO role_change_log (type, user_id, role_id, chapter_id, changed_by, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [type, userId, roleId, chapterId, changedBy])
  }

  // Verificar token y obtener roles actuales
  static verifyTokenAndGetRoles(token: string): { valid: boolean; payload?: any; needsRefresh?: boolean } {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as any
      
      // Verificar si el token es muy antiguo (más de 1 hora sin roles actualizados)
      const tokenAge = Date.now() - (payload.iat * 1000)
      const needsRefresh = tokenAge > 3600000 || !payload.roles // 1 hora

      return {
        valid: true,
        payload,
        needsRefresh
      }
    } catch (error) {
      return { valid: false }
    }
  }
}