// pages/api/auth/callback.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { WikipediaOAuth } from '@/lib/oauth'
import { Database } from '@/lib/database'
import { JWTManager } from '@/lib/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }
  
  try {
    const { oauth_token, oauth_verifier, origin } = req.query
    
    if (!oauth_token || !oauth_verifier) {
      return res.redirect(`https://${origin}/login?error=authorization_failed`)
    }
    
    // Obtener token temporal
    const tokenData = await Database.getOAuthToken(oauth_token as string)
    if (!tokenData) {
      return res.redirect(`https://${origin}/login?error=token_expired`)
    }
    
    const oauthClient = new WikipediaOAuth()
    
    // Obtener token de acceso
    const { token: accessToken, tokenSecret: accessTokenSecret } = await oauthClient.getAccessToken(
      oauth_token as string,
      tokenData.request_token_secret,
      oauth_verifier as string
    )
    
    // Obtener información del usuario
    const userInfo = await oauthClient.getUserInfo(accessToken, accessTokenSecret)
    
    // Buscar o crear usuario
    let user = await Database.getUserByWikipediaId(userInfo.id.toString())
    
    if (!user) {
      user = await Database.createUser({
        name: userInfo.name,
        wikipedia_id: userInfo.id.toString(),
        wikipedia_username: userInfo.name,
        wikimedia_role: 'community_partner',
        avatar_url: `https://meta.wikimedia.org/wiki/User:${userInfo.name}`
      })
    } else {
      await Database.updateUserLogin(user.id)
    }
    
    // Crear sesión
    const sessionData = {
      user_id: user.id,
      token_hash: JWTManager.hashToken(JWTManager.generateSecureToken()),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      origin_domain: tokenData.origin_domain,
      user_agent: req.headers['user-agent'],
      ip_address: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress
    }
    
    const session = await Database.createSession(sessionData)
    
    // Generar JWT
    const jwtToken = JWTManager.generateToken(user, session.id)
    
    // Limpiar token temporal
    await Database.deleteOAuthToken(oauth_token as string)
    
    // Crear cookie y redirigir
    res.setHeader('Set-Cookie', [
      `auth_token=${jwtToken}; Domain=.${process.env.DOMAIN}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
      `user_info=${encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.wikimedia_role,
        chapter: user.chapter_assigned,
        wikipediaUsername: user.wikipedia_username
      }))}; Domain=.${process.env.DOMAIN}; Path=/; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    ])
    
    res.redirect(`https://${tokenData.origin_domain}/dashboard`)
  } catch (error) {
    console.error('Error en callback:', error)
    res.redirect(`https://${req.query.origin}/login?error=authentication_failed`)
  }
}