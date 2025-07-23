"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useI18n } from "@/hooks/use-i18n"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface Role {
  id: number
  name: string
}

export function AddMemberForm({ chapterSlug }: { chapterSlug: string }) {
  const [username, setUsername] = useState("")
  const [wikimediaId, setWikimediaId] = useState("")
  const [roleId, setRoleId] = useState<string | null>(null)
  const [joinedAt, setJoinedAt] = useState<Date | undefined>(undefined) // State for joined_at
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useI18n()

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
        toast({
          title: t("error"),
          description: error.message,
          variant: "destructive",
        })
      }
    }
    fetchRoles()
  }, [toast, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!username || !wikimediaId || !roleId) {
      toast({
        title: t("missing_fields"),
        description: t("all_fields_required"),
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/chapters/${chapterSlug}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          wikimedia_id: wikimediaId,
          role_id: Number.parseInt(roleId),
          joined_at: joinedAt ? format(joinedAt, "yyyy-MM-dd HH:mm:ss") : null, // Format date or send null
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to add member")
      }

      toast({
        title: t("success"),
        description: t("member_added_successfully"),
      })
      setUsername("")
      setWikimediaId("")
      setRoleId(null)
      setJoinedAt(undefined) // Reset date
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder={t("username")}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        disabled={loading}
      />
      <Input
        placeholder={t("wikimedia_id")}
        value={wikimediaId}
        onChange={(e) => setWikimediaId(e.target.value)}
        required
        disabled={loading}
      />
      <Select onValueChange={setRoleId} value={roleId || ""}>
        <SelectTrigger disabled={loading}>
          <SelectValue placeholder={t("select_role")} />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !joinedAt && "text-muted-foreground")}
            disabled={loading}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {joinedAt ? format(joinedAt, "PPP") : <span>{t("pick_joined_date_optional")}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={joinedAt} onSelect={setJoinedAt} initialFocus />
        </PopoverContent>
      </Popover>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t("adding_member") : t("add_member")}
      </Button>
    </form>
  )
}
