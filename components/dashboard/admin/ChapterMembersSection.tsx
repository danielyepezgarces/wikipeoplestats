'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  chapterId: number
  onSuccess?: () => void
}

const chapterRoles = [
  { id: 3, label: 'Chapter Admin' },
  { id: 4, label: 'Moderator' },
  { id: 5, label: 'Staff' },
  { id: 6, label: 'Partner' },
  { id: 7, label: 'Affiliate' }
]

export function AddMemberForm({ chapterId, onSuccess }: Props) {
  const [username, setUsername] = useState('')
  const [roleId, setRoleId] = useState('3')
  const [loading, setLoading] = useState(false)

  const handleAddMember = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/chapters/${chapterId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, roleId: parseInt(roleId) })
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error?.error || 'Failed to add member')
      } else {
        toast.success('Member added successfully')
        setUsername('')
        setRoleId('3')
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      toast.error('Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="grid gap-2">
          <Label>Username</Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>

        <div className="grid gap-2">
          <Label>Role</Label>
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {chapterRoles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleAddMember} disabled={loading}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </CardContent>
    </Card>
  )
}
