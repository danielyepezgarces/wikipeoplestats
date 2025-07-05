// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { WikipediaOAuth } from '@/lib/oauth'
import { Database } from '@/lib/database'

// Función para manejar solicitudes GET
export async function GET(request: NextRequest) {
  try {
    // Obtener el dominio de origen desde la query string
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get('origin')
    const originDomain = origin || 'www.wikipeoplestats.org'

    // Instanciar cliente OAuth
    const oauthClient = new WikipediaOAuth()

    // Obtener URL de autorización y tokens temporales
    const { url, token, tokenSecret } = await oauthClient.getAuthorizationUrl(originDomain)

    // Guardar tokens en la base de datos
    await Database.storeOAuthToken(token, tokenSecret, originDomain)

    // Redirigir al usuario a Wikipedia
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función para manejar solicitudes POST
export async function POST(request: NextRequest) {
  try {
    // Obtener el dominio de origen desde el body
    const body = await request.json()
    const origin = body.origin
    const originDomain = origin || 'www.wikipeoplestats.org'

    // Instanciar cliente OAuth
    const oauthClient = new WikipediaOAuth()

    // Obtener URL de autorización y tokens temporales
    const { url, token, tokenSecret } = await oauthClient.getAuthorizationUrl(originDomain)

    // Guardar tokens en la base de datos
    await Database.storeOAuthToken(token, tokenSecret, originDomain)

    // Redirigir al usuario a Wikipedia
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función para manejar solicitudes OPTIONS (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}