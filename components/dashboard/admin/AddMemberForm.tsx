"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { PlusCircle, Loader2, CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Props {
  chapterSlug: string
  onSuccess?: () => void
}

interface WikimediaUser {
  userid: number
  name: string
}

const chapterRoles = [
  { id: 3, label: "Chapter Admin" },
  { id: 4, label: "Moderator" },
  { id: 5, label: "Staff" },
  { id: 6, label: "Partner" },
  { id: 7, label: "Affiliate" },
]

export function AddMemberForm({ chapterSlug, onSuccess }: Props) {
  const [username, setUsername] = useState("")
  const [roleId, setRoleId] = useState("3")
  const [joinedAt, setJoinedAt] = useState<Date | undefined>(undefined)
  const [bannerCredits, setBannerCredits] = useState("")
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)

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
          wikimedia_id: wikimediaUser.userid, // Pasar el userid de Wikimedia
          role_id: Number.parseInt(roleId),
          joined_at: joinedAt ? format(joinedAt, "yyyy-MM-dd") : null, // Pass formatted date or null
          banner_credits: bannerCredits.trim() || null, // Pass credits or null if empty
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error?.error || "Failed to add member")
      } else {
        const result = await res.json()
        if (result.created) {
          toast.success("Member added successfully (new user created)")
        } else {
          toast.success("Member added successfully")
        }
        setUsername("")
        setRoleId("3")
        setJoinedAt(undefined)
        setBannerCredits("")
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      console.error("Error adding member:", err)
      toast.error("Unexpected error occurred")
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
          <Select value={roleId} onValueChange={setRoleId} disabled={loading || validating}>
            <SelectTrigger id="role">
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

        <div className="grid gap-2">
          <Label htmlFor="joined-at">Joined At (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !joinedAt && "text-muted-foreground")}
                disabled={loading || validating}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {joinedAt ? format(joinedAt, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={joinedAt} onSelect={setJoinedAt} initialFocus />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-gray-500 dark:text-gray-400">Leave empty to use current date.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="banner-credits">Banner Credits (Optional)</Label>
          <Input
            id="banner-credits"
            value={bannerCredits}
            onChange={(e) => setBannerCredits(e.target.value)}
            placeholder="Enter banner author name"
            disabled={loading || validating}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Name of the author for the chapter banner.</p>
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
