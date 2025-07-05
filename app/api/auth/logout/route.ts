// pages/api/auth/logout.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { JWTManager } from '@/lib/jwt'
import { Database } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }
  
  try {
    const token = req.cookies.auth_token
    
    if (token) {
      const payload = JWTManager.verifyToken(token)
      if (payload) {
        await Database.deleteSession(payload.sessionId)
      }
    }
    
    // Limpiar cookies
    res.setHeader('Set-Cookie', [
      `auth_token=; Domain=.${process.env.DOMAIN}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      `user_info=; Domain=.${process.env.DOMAIN}; Path=/; Secure; SameSite=Lax; Max-Age=0`
    ])
    
    res.json({ message: 'Sesión cerrada' })
  } catch (error) {
    console.error('Error cerrando sesión:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}