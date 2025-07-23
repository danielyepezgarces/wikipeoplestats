"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner" // Import toast from sonner
import { useI18n } from "@/hooks/use-i18n"

interface Chapter {
  id: number
  name: string
  slug: string
  description: string
  status: string
  avatar_url: string | null // Re-added avatar_url
  banner_url: string | null
  banner_credits: string | null
}

interface Props {
  chapter: Chapter
  onSuccess?: () => void
}

export function EditChapterForm({ chapter, onSuccess }: Props) {
  const [name, setName] = useState(chapter.name)
  const [description, setDescription] = useState(chapter.description)
  const [status, setStatus] = useState(chapter.status)
  const [avatarUrl, setAvatarUrl] = useState(chapter.avatar_url || "") // State for avatar_url
  const [bannerUrl, setBannerUrl] = useState(chapter.banner_url || "")
  const [bannerCredits, setBannerCredits] = useState(chapter.banner_credits || "")
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    setName(chapter.name)
    setDescription(chapter.description)
    setStatus(chapter.status)
    setAvatarUrl(chapter.avatar_url || "") // Update state when chapter prop changes
    setBannerUrl(chapter.banner_url || "")
    setBannerCredits(chapter.banner_credits || "")
  }, [chapter])

  const handleUpdateChapter = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/chapters/${chapter.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          status,
          avatar_url: avatarUrl.trim() || null, // Send avatar_url
          banner_url: bannerUrl.trim() || null,
          banner_credits: bannerCredits.trim() || null,
          slug: chapter.slug, // Ensure slug is sent for consistency, though it's in the URL
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || data.error || t("failed_to_update_chapter"))
      }

      toast.success(data.message || t("chapter_updated_successfully"))
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error("Error updating chapter:", err)
      toast.error(err.message || t("unexpected_error_occurred"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("edit_chapter")}: {chapter.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">{t("chapter_name")}</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">{t("description")}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">{t("status")}</Label>
          <Select value={status} onValueChange={setStatus} disabled={loading}>
            <SelectTrigger id="status">
              <SelectValue placeholder={t("select_status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t("active")}</SelectItem>
              <SelectItem value="pending">{t("pending")}</SelectItem>
              <SelectItem value="archived">{t("archived")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="avatar-url">{t("avatar_url_optional")}</Label>
          <Input
            id="avatar-url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder={t("enter_url_for_chapter_avatar")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="banner-url">{t("banner_url_optional")}</Label>
          <Input
            id="banner-url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder={t("enter_url_for_chapter_banner_image")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="banner-credits">{t("banner_credits_optional")}</Label>
          <Input
            id="banner-credits"
            value={bannerCredits}
            onChange={(e) => setBannerCredits(e.target.value)}
            placeholder={t("name_of_banner_author_source")}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("credits_for_chapter_banner")}</p>
        </div>

        <Button onClick={handleUpdateChapter} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : t("update_chapter")}
        </Button>
      </CardContent>
    </Card>
  )
}
