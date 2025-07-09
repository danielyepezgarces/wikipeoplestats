import { getConnection } from '@/lib/database'

export async function getAllChaptersWithStats() {
  const conn = await getConnection()

  const [rows] = await conn.execute(`
    SELECT 
      c.id,
      c.slug,
      c.name,
      c.avatar_url,
      c.banner_url,
      c.banner_credits,
      c.banner_license,
      c.created_at,
      COUNT(cm.user_id) AS users
    FROM chapters c
    LEFT JOIN chapter_membership cm ON c.id = cm.chapter_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `)

  return rows
}
