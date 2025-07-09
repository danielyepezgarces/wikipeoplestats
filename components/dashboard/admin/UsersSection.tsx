'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Shield, Eye, Edit, Settings, Calendar } from 'lucide-react'

interface UserData {
  id: number
  username: string
  email: string
  roles: string[]
  chapter?: string
  created_at: string
}

const LIMIT = 10

export function UsersSection() {
  const [users, setUsers] = useState<UserData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(total / LIMIT)

  useEffect(() => {
    fetch(`/api/admin/users?page=${page}&limit=${LIMIT}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || [])
        setTotal(data.total || 0)
      })
      .catch((err) => {
        console.error('Error loading users', err)
        setUsers([])
        setTotal(0)
      })
  }, [page])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h2>
        <p className="text-gray-600 dark:text-gray-400">View all registered users and their roles</p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {user.username}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        {user.roles.join(', ')}
                      </span>
                      {user.chapter && (
                        <span className="flex items-center gap-1">
                          🏛️ {user.chapter}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Registered: {new Date(user.created_at).toLocaleDateString()}
                      </span>
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page {page} of {totalPages || 1}
        </p>

        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
