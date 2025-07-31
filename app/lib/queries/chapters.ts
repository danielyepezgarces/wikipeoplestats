import { getConnection } from '../database'

export async function getAllChaptersWithStats() {
  const conn = await getConnection()
  const [rows] = await conn.query(`
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.avatar_url,
      c.banner_url,
      c.status,

      -- Total de usuarios por capítulo
      COUNT(DISTINCT ur.user_id) AS users,

      -- Admins: usuarios con rol 'chapter_admin'
      SUM(CASE WHEN r.name = 'chapter_admin' THEN 1 ELSE 0 END) AS admins,

      -- Staff: solo incluye 'chapter_staff' y 'chapter_moderator'
      SUM(CASE WHEN r.name IN ('chapter_staff', 'chapter_moderator') THEN 1 ELSE 0 END) AS staff

    FROM chapters c
    LEFT JOIN user_roles ur ON ur.chapter_id = c.id
    LEFT JOIN roles r ON ur.role_id = r.id

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
