// app/api/admin/roles/assign/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAnyRole } from '@/lib/auth-middleware'
import { RoleManager } from '@/lib/role-manager'

export async function POST(request: NextRequest) {
  try {
    // Obtener datos de la petición
    const { userId, roleId, chapterId } = await request.json()

    if (!userId || !roleId || !chapterId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, roleId, chapterId' },
        { status: 400 }
      )
    }

    // Verificar permisos del admin (solo server-side)
    const auth = await requireAnyRole(request, ['super_admin', 'chapter_admin'], chapterId)

    // Asignar el rol
    await RoleManager.assignRole(userId, roleId, chapterId, auth.userId)

    return NextResponse.json({
      success: true,
      message: 'Role assigned successfully'
    })

  } catch (error) {
    console.error('Error assigning role:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('permissions') ? 403 : 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}