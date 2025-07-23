'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { AddMemberForm } from '@/components/dashboard/admin/AddMemberForm'

interface User {
  id: number
  username: string
  email: string
  role: string
  created_at: string
}

interface Props {
  chapterSlug: string
}

export function ChapterMembersSection({ chapterSlug }: Props) {
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = async () => {
    setLoading(true)
    const res = await fetch(`/api/chapters/${chapterSlug}/members`)
    if (res.ok) {
      const data = await res.json()
      setMembers(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMembers()
  }, [chapterId])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Members</h2>

      {/* Add member form */}
      <AddMemberForm chapterId={chapterId} onSuccess={fetchMembers} />

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading members...</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No members found.</p>
      ) : (
        members.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.username} ({user.role})
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
