"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Trash2 } from "lucide-react"
import { AddMemberForm } from "@/components/dashboard/admin/AddMemberForm"
import { toast } from "sonner"

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
    try {
      const res = await fetch(`/api/chapters/${chapterSlug}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      } else {
        toast.error("Failed to fetch members")
      }
    } catch (error) {
      toast.error("Error fetching members")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      const res = await fetch(`/api/chapters/${chapterSlug}/members?user_id=${userId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Member removed successfully")
        fetchMembers()
      } else {
        const error = await res.json()
        toast.error(error?.error || "Failed to remove member")
      }
    } catch (error) {
      toast.error("Error removing member")
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [chapterSlug]) // Fixed: was using chapterId instead of chapterSlug

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Members</h2>

      {/* Add member form */}
      <AddMemberForm chapterSlug={chapterSlug} onSuccess={fetchMembers} />

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading members...</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No members found.</p>
      ) : (
        <div className="space-y-3">
          {members.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.username} ({user.role})
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email && `${user.email} • `}
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveMember(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
