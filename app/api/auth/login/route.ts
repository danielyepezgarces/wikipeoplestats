// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { WikipediaOAuth } from '@/lib/oauth'
import { Database } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const originDomain = origin || 'www.wikipeoplestats.org'
    
    const oauthClient = new WikipediaOAuth()
    const { url, token, tokenSecret } = await oauthClient.getAuthorizationUrl(originDomain)
    
    // Guardar token temporal
    await Database.storeOAuthToken(token, tokenSecret, originDomain)
    
    // Redirigir
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}