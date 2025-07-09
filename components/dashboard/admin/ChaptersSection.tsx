'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Eye, Edit, Settings } from 'lucide-react'
import { CreateChapterForm } from '@/components/dashboard/create-chapter-form'
import { useAuth } from '@/hooks/use-auth'

interface Chapter {
  name: string
  users: number
  moderators: number
  status: 'active' | 'pending'
}

interface ChaptersSectionProps {
  chapters: Chapter[]
}

export function ChaptersSection({ chapters }: ChaptersSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Chapter Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all Wikimedia chapters globally
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Chapter
        </Button>
      </div>

      <div className="grid gap-4">
        {chapters.map((chapter, index) => (
          <Card key={index}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    chapter.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {chapter.name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>{chapter.users} users</span>
                      <span>{chapter.moderators} moderators</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
