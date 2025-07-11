// app/dashboard/chapters/[id]/admin/page.tsx
import { getCurrentUser } from '@/lib/auth'
import { getChapterById } from '@/lib/db/chapters'
import { redirect, notFound } from 'next/navigation'
import { EditChapterForm } from '@/components/dashboard/admin/EditChapterForm'
import { ChapterMembersSection } from '@/components/dashboard/admin/ChapterMembersSection'
import { SuperAdminHeader } from '@/components/dashboard/layout/SuperAdminHeader'
import { useState } from 'react'

export default async function ChapterAdminPage({ params }: { params: { id: string } }) {
    const user = await getCurrentUser()
    const chapterId = parseInt(params.id)
  const [currentLang, setCurrentLang] = useState('en')
    const chapter = await getChapterById(chapterId)
    if (!chapter) return notFound()

    const isSuperAdmin = user?.roles?.includes('super_admin')
    const isChapterAdmin = user?.chapter_admin_ids?.includes(chapterId)

    if (!isSuperAdmin && !isChapterAdmin) {
        redirect('/dashboard')
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
            <SuperAdminHeader user={user} currentLang={currentLang} />

            <h1 className="text-2xl font-bold">Admin Panel: {chapter.name}</h1>

            <EditChapterForm chapter={chapter} />
            <ChapterMembersSection chapterId={chapterId} />
        </div>
    )
}
