import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { ChapterAdminClient } from './client'
import { getChapterById, getChapterIdBySlug } from '@/lib/db/chapters'


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
    />
  )
}