import { getConnection } from '@/lib/database'

export async function getChapterById(id: number) {
  const conn = await getConnection()
  const [rows] = await conn.query(`SELECT * FROM chapters WHERE id = ?`, [id])
  return rows[0] || null
}
