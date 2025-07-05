// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { WikipediaOAuth } from '@/lib/oauth'
import { Database } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Método recibido:", req.method) // <-- Añade esto
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }
  
  try {
    const { origin } = req.query
    const originDomain = origin as string || 'www.wikipeoplestats.org'
    
    const oauthClient = new WikipediaOAuth()
    const { url, token, tokenSecret } = await oauthClient.getAuthorizationUrl(originDomain)
    
    // Guardar token temporal
    await Database.storeOAuthToken(token, tokenSecret, originDomain)
    
    // Redirigir a Wikipedia
    res.redirect(url)
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}