import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'
import { getChapterIdBySlug } from '@/lib/db/chapters'

interface Member {
  username: string
  join_date: string
  member_type: string
}

interface Chapter {
  slug: string
  group_name: string
  admin_name: string
  members_count: number
  group_description: string
  creation_date: string
  banner_image: string
  avatar_image: string
  image_credit: string
  members: Member[]
  stats: {
    totalPeople: number
    totalWomen: number
    totalMen: number
    otherGenders: number
    last_updated: string
  }
}

// Mock data - replace with actual database queries
const mockChapters: { [key: string]: Chapter } = {
  "wikimedia-argentina": {
    slug: "wikimedia-argentina",
    group_name: "Wikimedia Argentina",
    admin_name: "Daniel YG",
    members_count: 125,
    group_description: "Wikimedia Argentina promueve la educación y el acceso a la cultura",
    creation_date: "2024-01-01",
    banner_image: "https://wikimedia.org.ar/wp-content/uploads/2022/01/Marcha_del_orgullo_parana_2019_16-scaled.jpg",
    avatar_image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Wikimedia_Argentina_logo_white.svg",
    image_credit: "© Paula Kindsvater (CC-BY-SA 4.0)",
    members: [
      { username: "Usuario 1", join_date: "2023-01-01", member_type: "Afiliado" },
      { username: "Usuario 2", join_date: "2023-02-15", member_type: "Socio" },
      { username: "Usuario 3", join_date: "2023-03-30", member_type: "Afiliado" },
      { username: "Usuario 4", join_date: "2023-04-12", member_type: "Socio" },
      { username: "Usuario 5", join_date: "2023-05-25", member_type: "Afiliado" },
    ],
    stats: {
      totalPeople: 342,
      totalWomen: 128,
      totalMen: 198,
      otherGenders: 16,
      last_updated: new Date().toISOString()
    }
  },
  "wikimedia-espana": {
    slug: "wikimedia-espana",
    group_name: "Wikimedia España",
    admin_name: "Admin ES",
    members_count: 89,
    group_description: "Wikimedia España fomenta el conocimiento libre en España",
    creation_date: "2023-06-15",
    banner_image: "https://images.pexels.com/photos/3586966/pexels-photo-3586966.jpeg",
    avatar_image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Wikimedia_España_logo.svg/200px-Wikimedia_España_logo.svg.png",
    image_credit: "© Wikimedia España",
    members: [
      { username: "Admin ES", join_date: "2023-06-15", member_type: "Admin" },
      { username: "Miembro 1", join_date: "2023-07-01", member_type: "Socio" },
      { username: "Miembro 2", join_date: "2023-07-15", member_type: "Afiliado" },
    ],
    stats: {
      totalPeople: 256,
      totalWomen: 98,
      totalMen: 142,
      otherGenders: 16,
      last_updated: new Date().toISOString()
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // In a real application, you would fetch from your database
    // const chapter = await getChapterBySlug(slug)
    
    const chapter = mockChapters[slug]
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(chapter)
  } catch (error) {
    console.error('Error fetching chapter:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getCurrentUser()
  const chapterSlug = params.slug
  const chapterId = await getChapterIdBySlug(chapterSlug)

  if (!chapterId) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
  }

  if (!user || (!user.roles.includes('super_admin') && !user.chapter_admin_ids?.includes(chapterId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, slug, status, avatar_url, banner_url } = await req.json()
  const conn = await getConnection()

  await conn.query(
    `UPDATE chapters SET name = ?, slug = ?, status = ?, avatar_url = ?, banner_url = ? WHERE id = ?`,
    [name, slug, status, avatar_url || null, banner_url || null, chapterId]
  )

  return NextResponse.json({ success: true })
}