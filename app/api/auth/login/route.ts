// app/api/auth/login/route.ts - Versión corregida
import { NextRequest, NextResponse } from 'next/server'
import { WikipediaOAuth } from '@/lib/oauth'
import { Database } from '@/lib/database'

export async function GET(request: NextRequest) {
  console.log('🔍 Iniciando proceso de login...')
  
  try {
    // Paso 1: Verificar parámetros
    console.log('📋 Paso 1: Verificando parámetros...')
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get('origin')
    const originDomain = origin || 'www.wikipeoplestats.org'
    console.log('✅ Origin domain:', originDomain)

    // Paso 2: Verificar si las clases existen
    console.log('📋 Paso 2: Verificando importaciones...')
    
    if (!WikipediaOAuth) {
      console.error('❌ WikipediaOAuth no está disponible')
      return NextResponse.json(
        { error: 'WikipediaOAuth no está disponible' },
        { status: 500 }
      )
    }

    if (!Database) {
      console.error('❌ Database no está disponible')
      return NextResponse.json(
        { error: 'Database no está disponible' },
        { status: 500 }
      )
    }

    // Paso 3: Instanciar cliente OAuth
    console.log('📋 Paso 3: Creando cliente OAuth...')
    let oauthClient
    try {
      oauthClient = new WikipediaOAuth()
      console.log('✅ Cliente OAuth creado')
    } catch (error) {
      console.error('❌ Error creando cliente OAuth:', error)
      return NextResponse.json(
        { error: 'Error creating OAuth client', details: error instanceof Error ? error.message : 'Error desconocido' },
        { status: 500 }
      )
    }

    // Paso 4: Obtener URL de autorización
    console.log('📋 Paso 4: Obteniendo URL de autorización...')
    let authData
    try {
      authData = await oauthClient.getAuthorizationUrl(originDomain)
      console.log('✅ URL de autorización obtenida:', authData.url)
    } catch (error) {
      console.error('❌ Error obteniendo URL de autorización:', error)
      return NextResponse.json(
        { error: 'Error getting authorization URL', details: error instanceof Error ? error.message : 'Error desconocido' },
        { status: 500 }
      )
    }

    // Paso 5: Guardar tokens
    console.log('📋 Paso 5: Guardando tokens...')
    try {
      await Database.storeOAuthToken(authData.token, authData.tokenSecret, originDomain)
      console.log('✅ Tokens guardados')
    } catch (error) {
      console.error('❌ Error guardando tokens:', error)
      return NextResponse.json(
        { error: 'Error storing tokens', details: error instanceof Error ? error.message : 'Error desconocido' },
        { status: 500 }
      )
    }

    // Paso 6: Redirigir
    console.log('📋 Paso 6: Redirigiendo...')
    return NextResponse.redirect(authData.url)

  } catch (error) {
    console.error('❌ Error general:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      message: 'POST funcionando correctamente',
      receivedData: body 
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Error en POST',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}