import { getCurrentUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'

export default async function AdminChapterPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'super_admin') {
    redirect('/dashboard') // o mostrar 404
  }

  const chapterId = parseInt(params.id)
  return (
    <div>
      <h1>Admin Panel for Chapter #{chapterId}</h1>
      {/* contenido */}
    </div>
  )
}
