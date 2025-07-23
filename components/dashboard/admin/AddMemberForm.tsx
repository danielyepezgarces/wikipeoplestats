"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2 } from "lucide-react"
import { toast } from "sonner" // Import toast from sonner

interface Props {
  chapterSlug: string
  onSuccess?: () => void
}

interface WikimediaUser {
  userid: number
  name: string
}

interface Role {
  id: number
  name: string
}

export function AddMemberForm({ chapterSlug, onSuccess }: Props) {
  const [username, setUsername] = useState("")
  const [roleId, setRoleId] = useState<string | null>(null)
  const [joinedAt, setJoinedAt] = useState<string | undefined>(undefined) // Changed to string for native date input
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("/api/admin/roles")
        if (!res.ok) {
          throw new Error("Failed to fetch roles")
        }
        const data = await res.json()
        setRoles(data)
      } catch (error: any) {
        toast.error(error.message || "Failed to load roles.")
      }
    }
    fetchRoles()
  }, [])

  const validateWikimediaUser = async (username: string): Promise<WikimediaUser | null> => {
    setValidating(true)
    try {
      // Validate user exists in Wikimedia Meta
      const response = await fetch(
        `https://meta.wikimedia.org/w/api.php?action=query&list=users&ususers=${encodeURIComponent(username)}&format=json&origin=*`,
      )

      if (!response.ok) {
        throw new Error("Failed to validate user")
      }

      const data = await response.json()
      const users = data.query?.users || []

      if (users.length === 0) {
        return null
      }

      const user = users[0]
      // Check if user exists and is not missing
      if (user.missing || user.name !== username) {
        return null
      }

      return {
        userid: user.userid,
        name: user.name,
      }
    } catch (error) {
      console.error("Error validating Wikimedia user:", error)
      return null
    } finally {
      setValidating(false)
    }
  }

  const handleAddMember = async () => {
    if (!username.trim()) {
      toast.error("Username is required")
      return
    }
    if (!roleId) {
      toast.error("Role is required")
      return
    }

    // Validate username format (basic check)
    if (!/^[A-Za-z0-9_\s-]+$/.test(username)) {
      toast.error("Invalid username format")
      return
    }

    setLoading(true)
    try {
      // First validate the user exists in Wikimedia Meta
      const wikimediaUser = await validateWikimediaUser(username)
      if (!wikimediaUser) {
        toast.error("User not found in Wikimedia Meta. Please check the username.")
        setLoading(false)
        return
      }

      // Add member to chapter
      const res = await fetch(`/api/chapters/${chapterSlug}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: wikimediaUser.name,
          wikimedia_id: wikimediaUser.userid, // Pass the wikimedia_id
          role_id: Number.parseInt(roleId),
          joined_at: joinedAt || null, // Pass native date string or null
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error?.message || error?.error || "Failed to add member")
      } else {
        const result = await res.json()
        toast.success(result.message || "Member added successfully!")
        setUsername("")
        setRoleId(null)
        setJoinedAt(undefined) // Reset date
        if (onSuccess) onSuccess()
      }
    } catch (err: any) {
      console.error("Error adding member:", err)
      toast.error("Unexpected error occurred: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Wikimedia Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Wikimedia username (e.g., JohnDoe)"
            disabled={loading || validating}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Username will be validated against Wikimedia Meta</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          <Select value={roleId || ""} onValueChange={setRoleId} disabled={loading || validating}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="joined-at">Joined At (Optional)</Label>
          <Input
            id="joined-at"
            type="date" // Native date input
            value={joinedAt || ""}
            onChange={(e) => setJoinedAt(e.target.value)}
            disabled={loading || validating}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Leave empty to use current date.</p>
        </div>

        <Button onClick={handleAddMember} disabled={loading || validating}>
          {loading || validating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <PlusCircle className="w-4 h-4 mr-2" />
          )}
          {validating ? "Validating..." : loading ? "Adding..." : "Add Member"}
        </Button>
      </CardContent>
    </Card>
  )
}
