import { getConnection } from "@/lib/database"

export async function getChapterById(id: number) {
  const conn = await getConnection()
  try {
    const [rows] = await conn.query(`SELECT * FROM chapters WHERE id = ?`, [id])
    return (rows as any[])[0] || null
  } finally {
    conn.release()
  }
}

export async function getChapterIdBySlug(slug: string): Promise<number | null> {
  try {
    const conn = await getConnection()
    try {
      const [rows] = await conn.query("SELECT id FROM chapters WHERE slug = ?", [slug])
      return (rows as any[])[0]?.id || null
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error("Error fetching chapter by slug:", error)
    return null
  }
}
