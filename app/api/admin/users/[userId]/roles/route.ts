// app/api/admin/users/[userId]/roles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkPermission } from '@/lib/auth-middleware'
import { RoleManager } from '@/lib/role-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const targetUserId = parseInt(userId)

    if (isNaN(targetUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Verificar autenticación
    const auth = await requireAuth(request)

    // Solo super admins y chapter admins pueden ver roles de otros usuarios
    // Los usuarios pueden ver sus propios roles
    if (auth.userId !== targetUserId) {
      const { hasPermission } = await checkPermission(request, 'manage_users')
      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // Obtener roles del usuario
    const roles = await RoleManager.getUserRoles(targetUserId)

    return NextResponse.json({
      userId: targetUserId,
      roles: roles
    })

  } catch (error) {
    console.error('Error fetching user roles:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('permissions') || error.message.includes('Authentication') ? 403 : 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}