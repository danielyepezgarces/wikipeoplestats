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

interface Chapter {
  id: number
  name: string
  slug: string
  description: string
  status: string
  banner_url: string | null
  banner_credits: string | null // Added banner_credits
}

interface Props {
  chapter: Chapter
  onSuccess?: () => void
}

export function EditChapterForm({ chapter, onSuccess }: Props) {
  const [name, setName] = useState(chapter.name)
  const [description, setDescription] = useState(chapter.description)
  const [status, setStatus] = useState(chapter.status)
  const [bannerUrl, setBannerUrl] = useState(chapter.banner_url || "")
  const [bannerCredits, setBannerCredits] = useState(chapter.banner_credits || "") // State for banner_credits
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setName(chapter.name)
    setDescription(chapter.description)
    setStatus(chapter.status)
    setBannerUrl(chapter.banner_url || "")
    setBannerCredits(chapter.banner_credits || "") // Update state when chapter prop changes
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
          banner_url: bannerUrl.trim() || null,
          banner_credits: bannerCredits.trim() || null, // Send banner_credits
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error?.message || error?.error || "Failed to update chapter")
      }

      toast.success("Chapter updated successfully!")
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error("Error updating chapter:", err)
      toast.error(err.message || "Unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Chapter: {chapter.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Chapter Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus} disabled={loading}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="archived">Archived</SelectItem> {/* Example additional status */}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="banner-url">Banner URL (Optional)</Label>
          <Input
            id="banner-url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="Enter URL for chapter banner image"
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="banner-credits">Banner Credits (Optional)</Label>
          <Input
            id="banner-credits"
            value={bannerCredits}
            onChange={(e) => setBannerCredits(e.target.value)}
            placeholder="Name of banner author/source"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Credits for the chapter's banner image.</p>
        </div>

        <Button onClick={handleUpdateChapter} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Update Chapter"}
        </Button>
      </CardContent>
    </Card>
  )
}
