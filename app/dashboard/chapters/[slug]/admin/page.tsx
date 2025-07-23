import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { getChapterById, getChapterIdBySlug } from '@/lib/db/chapters'
import { ChapterAdminClient } from '../../[id]/admin/client'

export default async function ChapterAdminPage({ params }: { params: { slug: string } }) {
  const user = await getCurrentUser()
  const chapterId = await getChapterIdBySlug(params.slug)

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
      slug={params.slug} // ← Pasamos el slug aquí
    />
  )
}
