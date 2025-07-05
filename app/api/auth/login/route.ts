// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { WikipediaOAuth } from '@/lib/oauth'
import { Database } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log para debugging
  console.log('Método recibido:', req.method)
  console.log('Headers:', req.headers)
  
  // Soporte para preflight CORS (solicitudes OPTIONS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*') // O limita según origen esperado
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  // Permitir tanto GET como POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    console.error('Método no permitido:', req.method)
    return res.status(405).json({ 
      error: 'Método no permitido',
      received: req.method,
      allowed: ['GET', 'POST']
    })
  }

  try {
    // Obtener el dominio de origen desde la query string o body
    let origin: string
    
    if (req.method === 'GET') {
      origin = req.query.origin as string
    } else {
      // Para POST, obtener desde el body
      origin = req.body.origin as string
    }
    
    const originDomain = origin || 'www.wikipeoplestats.org'

    // Instanciar cliente OAuth
    const oauthClient = new WikipediaOAuth()

    // Obtener URL de autorización y tokens temporales
    const { url, token, tokenSecret } = await oauthClient.getAuthorizationUrl(originDomain)

    // Guardar tokens en la base de datos
    await Database.storeOAuthToken(token, tokenSecret, originDomain)

    // Redirigir al usuario a Wikipedia
    res.redirect(url)
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}