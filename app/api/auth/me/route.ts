// pages/api/auth/me.ts
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies['auth_token']
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    res.status(200).json({ user: { id: decoded.userId, username: decoded.username, email: decoded.email } })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
