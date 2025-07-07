// app/api/admin/roles/remove/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { RoleManager } from '@/lib/role-manager'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as any
    const adminUserId = payload.userId

    // Obtener datos de la petición
    const { userId, roleId, chapterId } = await request.json()

    if (!userId || !roleId || !chapterId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, roleId, chapterId' },
        { status: 400 }
      )
    }

    // Verificar permisos del admin
    const canManage = await RoleManager.canManageRoles(adminUserId, chapterId)
    if (!canManage) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Remover el rol
    await RoleManager.removeRole(userId, roleId, chapterId, adminUserId)

    return NextResponse.json({
      success: true,
      message: 'Role removed successfully'
    })

  } catch (error) {
    console.error('Error removing role:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}