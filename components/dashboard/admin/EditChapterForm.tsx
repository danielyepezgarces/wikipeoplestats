"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Import Select components
import { useToast } from "@/components/ui/use-toast"
import { useI18n } from "@/hooks/use-i18n"

interface EditChapterFormProps {
  chapter: {
    id: number
    name: string
    slug: string
    status: string
    avatar_url?: string
    banner_url?: string
    banner_credits?: string // Added banner_credits
  }
}

export function EditChapterForm({ chapter }: EditChapterFormProps) {
  const [form, setForm] = useState({
    name: chapter.name,
    slug: chapter.slug,
    status: chapter.status,
    avatar_url: chapter.avatar_url || "",
    banner_url: chapter.banner_url || "",
    banner_credits: chapter.banner_credits || "", // Initialize banner_credits
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { t } = useI18n()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleStatusChange = (value: string) => {
    setForm({ ...form, status: value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/chapters/${chapter.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Error updating chapter")
      }

      toast({
        title: t("success"),
        description: t("chapter_updated_successfully"),
      })
    } catch (err: any) {
      toast({
        title: t("error"),
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input name="name" value={form.name} onChange={handleChange} placeholder={t("name")} disabled={saving} />
      <Input name="slug" value={form.slug} onChange={handleChange} placeholder={t("slug")} disabled={saving} />

      <Select onValueChange={handleStatusChange} value={form.status} disabled={saving}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("select_status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">{t("active")}</SelectItem>
          <SelectItem value="pending">{t("pending")}</SelectItem>
        </SelectContent>
      </Select>

      <Input
        name="avatar_url"
        value={form.avatar_url}
        onChange={handleChange}
        placeholder={t("avatar_url")}
        disabled={saving}
      />
      <Input
        name="banner_url"
        value={form.banner_url}
        onChange={handleChange}
        placeholder={t("banner_url")}
        disabled={saving}
      />
      <Input
        name="banner_credits"
        value={form.banner_credits}
        onChange={handleChange}
        placeholder={t("banner_credits")}
        disabled={saving}
      />
      <Button onClick={handleSave} disabled={saving}>
        {saving ? t("saving") : t("save_changes")}
      </Button>
    </div>
  )
}
