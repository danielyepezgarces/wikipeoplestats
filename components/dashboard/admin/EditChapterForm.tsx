'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EditChapterFormProps {
  chapter: {
    id: number
    name: string
    slug: string
    status: string
    avatar_url?: string
    banner_url?: string
  }
}

export function EditChapterForm({ chapter }: EditChapterFormProps) {
  const [form, setForm] = useState(chapter)
  const [saving, setSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/chapters/${chapter.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) alert('Chapter updated!')
    else alert('Error updating chapter')
  }

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h2 className="text-lg font-semibold">Edit Chapter Info</h2>

      <Input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
      <Input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug" />
      <Input name="status" value={form.status} onChange={handleChange} placeholder="Status" />
      <Input name="avatar_url" value={form.avatar_url || ''} onChange={handleChange} placeholder="Avatar URL" />
      <Input name="banner_url" value={form.banner_url || ''} onChange={handleChange} placeholder="Banner URL" />

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
