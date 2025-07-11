'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

interface SuperAdminHeaderProps {
  user: {
    name: string
    email: string
  }
  handleLogout: () => void
  generateAvatarFromEmail: (email: string) => string
}

export function SuperAdminHeader({
  user,
  handleLogout,
  generateAvatarFromEmail,
}: SuperAdminHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Super Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Global System Management
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="destructive" className="hidden sm:inline-flex">
              Super Admin
            </Badge>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-red-500 text-white text-sm font-medium">
                    {generateAvatarFromEmail(user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                    {user.email}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-red-500 text-white font-medium">
                          {generateAvatarFromEmail(user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                        <Badge variant="destructive" className="mt-1">
                          Super Admin
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
