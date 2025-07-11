'use client'

import { useState } from 'react'
import { SuperAdminHeader } from '@/components/dashboard/layout/SuperAdminHeader'
import { EditChapterForm } from '@/components/dashboard/admin/EditChapterForm'
import { ChapterMembersSection } from '@/components/dashboard/admin/ChapterMembersSection'
import { useI18n } from '@/hooks/use-i18n'

interface ChapterAdminClientProps {
  user: {
    name: string
    email: string
    role: string
    chapter?: string
  }
  chapter: {
    id: number
    name: string
    // puedes incluir más campos si los necesitas
  }
  chapterId: number
}

export function ChapterAdminClient({
  user,
  chapter,
  chapterId
}: ChapterAdminClientProps) {
  const [currentLang, setCurrentLang] = useState('en')
  const { t } = useI18n(currentLang)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header ancho completo */}
      <SuperAdminHeader user={user} currentLang={currentLang} />

      {/* Contenido limitado al centro */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <h1 className="text-2xl font-bold">
          {t('Admin Panel')}: {chapter.name}
        </h1>

        <EditChapterForm chapter={chapter} />
        <ChapterMembersSection chapterId={chapterId} />
      </div>
    </div>
  )
}
