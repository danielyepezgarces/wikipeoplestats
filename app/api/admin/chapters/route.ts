import { NextResponse } from 'next/server'
import { getAllChaptersWithStats } from '@/lib/queries/chapters'

export async function GET() {
  try {
    const chapters = await getAllChaptersWithStats()
    return NextResponse.json(chapters)
  } catch (error) {
    console.error('[API][admin/chapters] Error:', error)
    return NextResponse.json({ error: 'Error al obtener los chapters' }, { status: 500 })
  }
}
