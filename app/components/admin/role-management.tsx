// components/admin/role-management.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useRoleManager } from '@/hooks/use-role-manager'
import { Loader2, UserPlus, UserMinus, RefreshCw } from 'lucide-react'

interface Role {
  id: number
  name: string
  i18n_key: string
}

interface Chapter {
  id: number
  slug: string
  name: string
}

interface User {
  id: number
  username: string
  email: string
}

interface RoleManagementProps {
  targetUser: User
  availableRoles: Role[]
  availableChapters: Chapter[]
}

export function RoleManagement({ 
  targetUser, 
  availableRoles, 
  availableChapters 
}: RoleManagementProps) {
  const { toast } = useToast()
  const { 
    roles, 
    loading, 
    error, 
    refreshRoles, 
    assignRole, 
    removeRole, 
    canManageRoles 
  } = useRoleManager()

  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedChapter, setSelectedChapter] = useState<string>('')
  const [actionLoading, setActionLoading] = useState(false)

  // Filtrar roles del usuario objetivo
  const userRoles = roles.filter(role => role.user_id === targetUser.id)

  const handleAssignRole = async () => {
    if (!selectedRole || !selectedChapter) {
      toast({
        title: 'Error',
        description: 'Please select both role and chapter',
        variant: 'destructive'
      })
      return
    }

    const roleId = parseInt(selectedRole)
    const chapterId = parseInt(selectedChapter)

    // Verificar permisos
    if (!canManageRoles(chapterId)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to manage roles in this chapter',
        variant: 'destructive'
      })
      return
    }

    setActionLoading(true)
    const success = await assignRole(targetUser.id, roleId, chapterId)
    
    if (success) {
      toast({
        title: 'Success',
        description: 'Role assigned successfully'
      })
      setSelectedRole('')
      setSelectedChapter('')
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to assign role',
        variant: 'destructive'
      })
    }
    setActionLoading(false)
  }

  const handleRemoveRole = async (roleId: number, chapterId: number) => {
    // Verificar permisos
    if (!canManageRoles(chapterId)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to manage roles in this chapter',
        variant: 'destructive'
      })
      return
    }

    setActionLoading(true)
    const success = await removeRole(targetUser.id, roleId, chapterId)
    
    if (success) {
      toast({
        title: 'Success',
        description: 'Role removed successfully'
      })
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to remove role',
        variant: 'destructive'
      })
    }
    setActionLoading(false)
  }

  const getRoleName = (roleId: number) => {
    const role = availableRoles.find(r => r.id === roleId)
    return role?.name || 'Unknown Role'
  }

  const getChapterName = (chapterId: number) => {
    const chapter = availableChapters.find(c => c.id === chapterId)
    return chapter?.name || chapter?.slug || 'Unknown Chapter'
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'super_admin':
        return 'bg-red-500'
      case 'chapter_admin':
        return 'bg-orange-500'
      case 'chapter_moderator':
        return 'bg-blue-500'
      case 'chapter_staff':
        return 'bg-green-500'
      case 'chapter_partner':
        return 'bg-purple-500'
      case 'chapter_affiliate':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Role Management - {targetUser.username}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRoles}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Roles */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Current Roles</h3>
          {userRoles.length === 0 ? (
            <p className="text-gray-500">No roles assigned</p>
          ) : (
            <div className="space-y-2">
              {userRoles.map((userRole) => (
                <div
                  key={`${userRole.role_id}-${userRole.chapter_id}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge className={getRoleColor(userRole.role_name)}>
                      {userRole.role_name}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      in {getChapterName(userRole.chapter_id)}
                    </span>
                  </div>
                  
                  {canManageRoles(userRole.chapter_id) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveRole(userRole.role_id, userRole.chapter_id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserMinus className="h-4 w-4" />
                      )}
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign New Role */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Assign New Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger>
                <SelectValue placeholder="Select chapter" />
              </SelectTrigger>
              <SelectContent>
                {availableChapters
                  .filter(chapter => canManageRoles(chapter.id))
                  .map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id.toString()}>
                      {chapter.name || chapter.slug}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAssignRole}
              disabled={!selectedRole || !selectedChapter || actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Assign Role
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
