// lib/auth-middleware-new.ts
import { NextRequest } from 'next/server'
import { SessionManager, UserSession } from './session-manager'

export interface AuthContext {
  userId: number
  username: string
  email?: string
  roles: string[]
  chapterId?: number
  sessionId: number
}

// Extraer token de sesión de cookies o headers
function getSessionToken(request: NextRequest): string | null {
  // Primero intentar desde cookie
  const cookieToken = request.cookies.get('session_token')?.value
  if (cookieToken) return cookieToken

  // Luego desde header Authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '')
  }

  return null
}

// Obtener contexto de autenticación desde sesión
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  try {
    const sessionToken = getSessionToken(request)
    if (!sessionToken) return null

    const session = await SessionManager.validateSession(sessionToken)
    if (!session) return null

    return {
      userId: session.user_id,
      username: session.username,
      email: session.email,
      roles: session.roles,
      chapterId: session.chapter_id,
      sessionId: session.id
    }
  } catch (error) {
    console.error('Error getting auth context:', error)
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
  
  const hasRole = await SessionManager.userHasRole(auth.userId, requiredRole, chapterId)
  if (!hasRole) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`)
  }
  
  return auth
}

// Middleware para requerir cualquiera de varios roles
export async function requireAnyRole(
  request: NextRequest, 
  requiredRoles: string[], 
  chapterId?: number
): Promise<AuthContext> {
  const auth = await requireAuth(request)
  
  const hasAnyRole = await SessionManager.userHasAnyRole(auth.userId, requiredRoles, chapterId)
  if (!hasAnyRole) {
    throw new Error(`Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`)
  }
  
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
      hasPermission = await SessionManager.userHasRole(auth.userId, 'super_admin')
      break
    case 'manage_users':
      hasPermission = await SessionManager.userHasAnyRole(auth.userId, ['super_admin', 'chapter_admin'], chapterId)
      break
    case 'moderate':
      hasPermission = await SessionManager.userHasAnyRole(auth.userId, ['super_admin', 'chapter_admin', 'chapter_moderator'], chapterId)
      break
    case 'view_stats':
      hasPermission = await SessionManager.userHasAnyRole(auth.userId, [
        'super_admin', 'chapter_admin', 'chapter_moderator', 'chapter_staff', 'chapter_partner'
      ], chapterId)
      break
  }

  return { auth, hasPermission }
}

// Middleware para endpoints de API
export function withAuth(handler: (request: NextRequest, auth: AuthContext) => Promise<Response>) {
  return async (request: NextRequest) => {
    try {
      const auth = await requireAuth(request)
      return await handler(request, auth)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Authentication failed' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

// Middleware para endpoints que requieren roles específicos
export function withRole(
  requiredRoles: string | string[], 
  chapterId?: number
) {
  return function(handler: (request: NextRequest, auth: AuthContext) => Promise<Response>) {
    return async (request: NextRequest) => {
      try {
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
        const auth = await requireAnyRole(request, roles, chapterId)
        return await handler(request, auth)
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Insufficient permissions' }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
  }
}