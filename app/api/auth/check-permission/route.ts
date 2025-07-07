// app/api/auth/check-permission/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkPermission } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const hostname = request.nextUrl.hostname
    const AUTH_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN?.replace('https://', '') || 'auth.wikipeoplestats.org'
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // Verificación de dominio para check-permission
    if (!isDevelopment && hostname !== AUTH_DOMAIN) {
      console.log(`❌ Permission check accessed from unauthorized domain: ${hostname}`)
      return NextResponse.json({
        error: 'Domain restriction',
        message: 'Permission checks can only be performed from the authorized authentication domain'
      }, { status: 403 })
    }

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

    console.log(`🔐 Permission check: ${auth.username} requesting ${permission} for chapter ${chapterId}: ${hasPermission}`)

    return NextResponse.json({
      userId: auth.userId,
      permission,
      chapterId,
      hasPermission
    })

  } catch (error) {
    console.error('Error checking permission:', error)
    
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