// lib/auth-middleware.ts
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { RoleManager } from './role-manager'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthContext {
  userId: number
  username: string
  email?: string
}

// Extraer y verificar token de autenticación
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value

    if (!token) {
      return null
    }

    const payload = jwt.verify(token, JWT_SECRET) as any
    
    return {
      userId: payload.userId,
      username: payload.username,
      email: payload.email
    }
  } catch (error) {
    return null
  }
}

// Middleware para requerir autenticación
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const auth = await getAuthContext(request)
  if (!auth) {
    throw new Error('Authentication required')
  }
  return auth
}

// Middleware para requerir rol específico
export async function requireRole(
  request: NextRequest, 
  requiredRole: string, 
  chapterId?: number
): Promise<AuthContext> {
  const auth = await requireAuth(request)
  await RoleManager.requireRole(auth.userId, requiredRole, chapterId)
  return auth
}

// Middleware para requerir cualquiera de varios roles
export async function requireAnyRole(
  request: NextRequest, 
  requiredRoles: string[], 
  chapterId?: number
): Promise<AuthContext> {
  const auth = await requireAuth(request)
  await RoleManager.requireAnyRole(auth.userId, requiredRoles, chapterId)
  return auth
}

// Verificar permisos específicos
export async function checkPermission(
  request: NextRequest,
  permission: 'manage_users' | 'moderate' | 'view_stats' | 'super_admin',
  chapterId?: number
): Promise<{ auth: AuthContext; hasPermission: boolean }> {
  const auth = await requireAuth(request)
  
  let hasPermission = false
  
  switch (permission) {
    case 'super_admin':
      hasPermission = await RoleManager.hasRole(auth.userId, 'super_admin')
      break
    case 'manage_users':
      hasPermission = await RoleManager.hasAnyRole(auth.userId, ['super_admin', 'chapter_admin'], chapterId)
      break
    case 'moderate':
      hasPermission = await RoleManager.canModerate(auth.userId, chapterId)
      break
    case 'view_stats':
      hasPermission = await RoleManager.canViewStats(auth.userId, chapterId)
      break
  }

  return { auth, hasPermission }
}