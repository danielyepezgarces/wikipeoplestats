import { getConnection } from '@/lib/database'

export async function getChapterById(id: number) {
  const conn = await getConnection()
  const [rows] = await conn.query(`SELECT * FROM chapters WHERE id = ?`, [id])
  return rows[0] || null
}

export async function getChapterIdBySlug(slug: string): Promise<number | null> {
  try {
    const conn = await getConnection()
    const [rows] = await conn.query('SELECT id FROM chapters WHERE slug = ?', [slug])
    return rows[0]?.id || null
  } catch (error) {
    console.error('Error fetching chapter by slug:', error)
    return null
  }
}
