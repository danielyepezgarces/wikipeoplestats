// app/api/auth/check-permission/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkPermission } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const permission = searchParams.get('permission')
    const chapterIdParam = searchParams.get('chapterId')
    
    if (!permission) {
      return NextResponse.json(
        { error: 'Permission parameter is required' },
        { status: 400 }
      )
    }

    const chapterId = chapterIdParam ? parseInt(chapterIdParam) : undefined

    // Verificar el permiso
    const { auth, hasPermission } = await checkPermission(
      request, 
      permission as any, 
      chapterId
    )

    return NextResponse.json({
      userId: auth.userId,
      permission,
      chapterId,
      hasPermission
    })

  } catch (error) {
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Authentication') ? 401 : 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}