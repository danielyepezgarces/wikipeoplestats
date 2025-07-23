import { NextRequest, NextResponse } from 'next/server'

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
  stats: {
    totalPeople: number
    totalWomen: number
    totalMen: number
    otherGenders: number
    last_updated: string
  }
}

// Mock data - replace with actual database queries
const mockChapters: Chapter[] = [
  {
    slug: "wikimedia-argentina",
    group_name: "Wikimedia Argentina",
    admin_name: "Daniel YG",
    members_count: 125,
    group_description: "Wikimedia Argentina promueve la educación y el acceso a la cultura",
    creation_date: "2024-01-01",
    banner_image: "https://wikimedia.org.ar/wp-content/uploads/2022/01/Marcha_del_orgullo_parana_2019_16-scaled.jpg",
    avatar_image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Wikimedia_Argentina_logo_white.svg",
    image_credit: "© Paula Kindsvater (CC-BY-SA 4.0)",
    stats: {
      totalPeople: 342,
      totalWomen: 128,
      totalMen: 198,
      otherGenders: 16,
      last_updated: new Date().toISOString()
    }
  },
  {
    slug: "wikimedia-espana",
    group_name: "Wikimedia España",
    admin_name: "Admin ES",
    members_count: 89,
    group_description: "Wikimedia España fomenta el conocimiento libre en España",
    creation_date: "2023-06-15",
    banner_image: "https://images.pexels.com/photos/3586966/pexels-photo-3586966.jpeg",
    avatar_image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Wikimedia_España_logo.svg/200px-Wikimedia_España_logo.svg.png",
    image_credit: "© Wikimedia España",
    stats: {
      totalPeople: 256,
      totalWomen: 98,
      totalMen: 142,
      otherGenders: 16,
      last_updated: new Date().toISOString()
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would fetch from your database
    // const chapters = await getChaptersFromDatabase()
    
    return NextResponse.json({
      chapters: mockChapters,
      total: mockChapters.length
    })
  } catch (error) {
    console.error('Error fetching chapters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    )
  }
}