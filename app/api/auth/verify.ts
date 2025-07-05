// pages/api/auth/verify.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { JWTManager } from '@/lib/jwt'
import { Database } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar CORS para subdominios
  res.setHeader('Access-Control-Allow-Origin', `https://${req.headers.origin}`)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }
  
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '') || req.cookies.auth_token
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }
    
    const payload = JWTManager.verifyToken(token)
    if (!payload) {
      return res.status(401).json({ error: 'Token inválido' })
    }
    
    // Verificar sesión en base de datos
    const session = await Database.getSessionByToken(JWTManager.hashToken(token))
    if (!session) {
      return res.status(401).json({ error: 'Sesión no encontrada' })
    }
    
    // Obtener usuario actualizado
    const user = await Database.getUserById(payload.userId)
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }
    
    // Actualizar uso de sesión
    await Database.updateSessionUsage(session.id)
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.wikimedia_role,
        chapter: user.chapter_assigned,
        wikipediaUsername: user.wikipedia_username,
        avatarUrl: user.avatar_url,
        lastLogin: user.last_login
      },
      session: {
        id: session.id,
        expiresAt: session.expires_at
      }
    })
  } catch (error) {
    console.error('Error verificando token:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}