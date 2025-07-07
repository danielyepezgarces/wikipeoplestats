import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  const hostname = request.nextUrl.hostname
  
  // Allow CORS for localhost during development and wikipeoplestats.org subdomains
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhostOrigin = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))
  const isWikipeopleOrigin = origin && origin.includes('wikipeoplestats.org')
  
  if ((isDevelopment && isLocalhostOrigin) || isWikipeopleOrigin) {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  }
  
  // Proteger rutas del dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth_token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}