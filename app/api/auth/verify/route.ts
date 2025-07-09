import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'wikipeoplestats',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies['auth_token']
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    // Obtener usuario
    const [userRows] = await db.query(
      'SELECT id, username, email, last_login FROM users WHERE id = ? LIMIT 1',
      [userId]
    )
    const user = (userRows as any)[0]
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Obtener roles
    const [roleRows] = await db.query(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [userId]
    )
    const roles = (roleRows as any[]).map(r => r.name)

    // Por compatibilidad con tu hook, tomar el primero como `role`
    const primaryRole = roles[0] || 'user'

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: primaryRole,
        roles,
        lastLogin: user.last_login,
        wikipediaUsername: user.username,
        avatarUrl: `https://meta.wikimedia.org/w/index.php?title=Special:CentralAuth&target=${encodeURIComponent(user.username)}&action=render&format=json`
      }
    })
  } catch (err) {
    console.error('❌ JWT/DB Error:', err)
    return res.status(401).json({ error: 'Invalid token or DB error' })
  }
}
