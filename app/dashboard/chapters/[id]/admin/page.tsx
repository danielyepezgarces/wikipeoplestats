import { getCurrentUser } from '@/lib/auth'
import { getChapterById } from '@/lib/db/chapters'
import { redirect, notFound } from 'next/navigation'
import { ChapterAdminClient } from './client'

export default async function ChapterAdminPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const chapterId = parseInt(params.id)

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
