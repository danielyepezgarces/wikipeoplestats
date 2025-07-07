import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.nextUrl.hostname
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Configuración de dominios permitidos
  const AUTH_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN?.replace(/https?:\/\//, '') || 'auth.wikipeoplestats.org'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Debugging - remover en producción
  console.log(`🔍 Request details:`, {
    pathname,
    hostname,
    origin,
    referer,
    AUTH_DOMAIN,
    isDevelopment,
    rawAuthDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN
  })
  
  // ========================================
  // 🔒 RESTRICCIÓN DE APIs DE AUTENTICACIÓN
  // ========================================
  if (pathname.startsWith('/api/auth/')) {
    console.log(`🔍 Auth API request: ${pathname} from ${hostname}`)
    
    // En desarrollo, permitir localhost
    if (isDevelopment) {
      const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
      if (isLocalhost) {
        console.log('✅ Development: localhost allowed')
        return addCorsHeaders(NextResponse.next(), origin, isDevelopment)
      }
    }
    
    // CORRECCIÓN: Verificar que el hostname sea exactamente el AUTH_DOMAIN
    if (hostname !== AUTH_DOMAIN) {
      console.log(`❌ Auth API blocked: hostname "${hostname}" is not "${AUTH_DOMAIN}"`)
      return new NextResponse(
        JSON.stringify({ 
          error: 'Forbidden', 
          message: 'Authentication APIs can only be accessed from the authorized domain',
          code: 'DOMAIN_RESTRICTED',
          debug: {
            hostname,
            expectedDomain: AUTH_DOMAIN,
            pathname
          }
        }), 
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Blocked-Reason': 'Domain restriction',
            'X-Allowed-Domain': AUTH_DOMAIN
          }
        }
      )
    }
    
    // Verificación adicional del Origin/Referer para requests AJAX
    if (origin || referer) {
      const requestOrigin = origin || new URL(referer || '').origin
      const allowedOrigins = [
        `https://${AUTH_DOMAIN}`,
        ...(isDevelopment ? ['http://localhost:3000', 'http://localhost:7080', 'http://127.0.0.1:3000'] : [])
      ]
      
      console.log(`🔍 Checking origin: "${requestOrigin}" against allowed origins:`, allowedOrigins)
      
      if (!allowedOrigins.some(allowed => requestOrigin.startsWith(allowed))) {
        console.log(`❌ Auth API blocked by origin: ${requestOrigin}`)
        return new NextResponse(
          JSON.stringify({ 
            error: 'Forbidden', 
            message: 'Invalid origin for authentication request',
            code: 'ORIGIN_RESTRICTED',
            debug: {
              requestOrigin,
              allowedOrigins
            }
          }), 
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              'X-Blocked-Reason': 'Origin restriction'
            }
          }
        )
      }
    }
    
    console.log(`✅ Auth API allowed: ${pathname}`)
    return addCorsHeaders(NextResponse.next(), origin, isDevelopment)
  }
  
  // ========================================
  // 🔒 RESTRICCIÓN DE APIs ADMINISTRATIVAS
  // ========================================
  if (pathname.startsWith('/api/admin/')) {
    console.log(`🔍 Admin API request: ${pathname} from ${hostname}`)
    
    // Las APIs admin también deben ser llamadas solo desde dominios autorizados
    const allowedDomains = [
      AUTH_DOMAIN,
      'www.wikipeoplestats.org',
      ...(isDevelopment ? ['localhost:3000', 'localhost:7080', '127.0.0.1:3000'] : [])
    ]
    
    const isAllowedDomain = allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    )
    
    if (!isAllowedDomain) {
      console.log(`❌ Admin API blocked: ${hostname} not in allowed domains`)
      return new NextResponse(
        JSON.stringify({ 
          error: 'Forbidden', 
          message: 'Administrative APIs are restricted',
          code: 'ADMIN_DOMAIN_RESTRICTED'
        }), 
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Blocked-Reason': 'Admin domain restriction'
          }
        }
      )
    }
    
    return addCorsHeaders(NextResponse.next(), origin, isDevelopment)
  }
  
  // ========================================
  // 🔒 CORS PARA OTRAS APIs
  // ========================================
  if (pathname.startsWith('/api/')) {
    return addCorsHeaders(NextResponse.next(), origin, isDevelopment)
  }
  
  // ========================================
  // 🔒 PROTECCIÓN DE RUTAS DEL DASHBOARD
  // ========================================
  if (pathname.startsWith('/dashboard')) {
    // Solo verificar que estemos en el dominio de auth para el dashboard
    if (!isDevelopment && hostname !== AUTH_DOMAIN) {
      return NextResponse.redirect(new URL(`https://${AUTH_DOMAIN}/dashboard`, request.url))
    }
    
    // Verificar token de autenticación
    const token = request.cookies.get('auth_token')
    if (!token) {
      const loginUrl = isDevelopment 
        ? new URL('/login', request.url)
        : new URL(`https://${AUTH_DOMAIN}/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

// Función helper para añadir headers CORS apropiados
function addCorsHeaders(response: NextResponse, origin: string | null, isDevelopment: boolean): NextResponse {
  if (!origin) return response
  
  const allowedOrigins = [
    'https://auth.wikipeoplestats.org',
    'https://www.wikipeoplestats.org',
    // Permitir subdominios de wikipeoplestats.org
    ...(origin.includes('wikipeoplestats.org') ? [origin] : []),
    // En desarrollo, permitir localhost
    ...(isDevelopment && (origin.includes('localhost') || origin.includes('127.0.0.1')) ? [origin] : [])
  ]
  
  if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.endsWith(allowed))) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('Access-Control-Max-Age', '86400') // 24 horas
  }
  
  return response
}

export const config = {
  matcher: [
    // Proteger todas las rutas de API de autenticación
    '/api/auth/:path*',
    // Proteger APIs administrativas
    '/api/admin/:path*',
    // Proteger otras APIs para CORS
    '/api/:path*',
    // Proteger dashboard
    '/dashboard/:path*',
    // Excluir archivos estáticos
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}