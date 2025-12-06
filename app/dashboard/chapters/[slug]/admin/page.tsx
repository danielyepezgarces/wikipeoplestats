import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { getChapterById, getChapterIdBySlug } from '@/lib/db/chapters'
import { ChapterAdminClient } from '../../[id]/admin/client'

export default async function ChapterAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser()
  const { slug } = await params
  const chapterId = await getChapterIdBySlug(slug)

  if (!chapterId) {
    return notFound()
  }

  const chapter = await getChapterById(chapterId)
  if (!chapter) return notFound()

  const isSuperAdmin = user?.roles?.includes('super_admin')
  const isChapterAdmin = user?.chapter_admin_ids?.includes(chapterId)

  if (!isSuperAdmin && !isChapterAdmin) {
    redirect('/dashboard')
  }

  return (
    <ChapterAdminClient
      user={user}
      chapter={chapter}
      chapterId={chapterId}
      slug={slug} // ← Pasamos el slug aquí
    />
  )
}
