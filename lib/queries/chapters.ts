import { getConnection } from '../database'

export async function getAllChaptersWithStats() {
  const conn = await getConnection()
  const [rows] = await conn.query(`
    SELECT c.id, c.name, c.slug, c.avatar_url, c.banner_url, COUNT(cm.user_id) AS users
    FROM chapters c
    LEFT JOIN chapter_membership cm ON c.id = cm.chapter_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `)
  return rows
}

export async function insertChapter({
  name,
  slug,
  avatar_url,
  banner_url,
  banner_credits,
  banner_license
}: {
  name: string,
  slug: string,
  avatar_url?: string | null,
  banner_url?: string | null,
  banner_credits?: string | null,
  banner_license?: string | null
}) {
  const conn = await getConnection()
  const [result]: any = await conn.query(`
    INSERT INTO chapters (name, slug, avatar_url, banner_url, banner_credits, banner_license)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [name, slug, avatar_url, banner_url, banner_credits, banner_license])
  return result.insertId
}
