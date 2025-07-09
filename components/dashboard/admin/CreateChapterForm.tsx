'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const WIKIMEDIA_LICENSES = [
  'CC-BY-SA-4.0',
  'CC-BY-4.0',
  'CC0-1.0',
  'CC-BY-SA-3.0',
  'GFDL-1.3',
  'GPL-3.0',
  'Public Domain',
]

export function CreateChapterForm() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [bannerCredits, setBannerCredits] = useState('')
  const [bannerLicense, setBannerLicense] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(name))
    }
  }, [name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !slug.trim() || !adminUsername.trim()) {
      setError('Name, slug, and admin username are required.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          slug,
          avatar_url: avatarUrl || null,
          banner_url: bannerUrl || null,
          banner_credits: bannerCredits || null,
          banner_license: bannerLicense,
          admin_username: adminUsername,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Error creating chapter')
        return
      }

      window.location.reload()
    } catch (err) {
      console.error(err)
      setError('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Chapter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Chapter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Chapter Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugManuallyEdited(true)
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Admin Username</Label>
            <Input
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Banner URL</Label>
            <Input
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Banner Credits</Label>
            <Input
              value={bannerCredits}
              onChange={(e) => setBannerCredits(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Banner License</Label>
            <Select value={bannerLicense} onValueChange={setBannerLicense}>
              <SelectTrigger>
                <SelectValue placeholder="Select a license" />
              </SelectTrigger>
              <SelectContent>
                {WIKIMEDIA_LICENSES.map((license) => (
                  <SelectItem key={license} value={license}>
                    {license}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Chapter'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
