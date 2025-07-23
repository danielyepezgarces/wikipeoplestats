"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Calendar, User, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NoticeBanner } from "@/components/notice-banner"
import { useI18n } from "@/hooks/use-i18n"
import { useDomainContext } from "@/hooks/use-domain-context"
import { getProject } from "@/lib/languages"

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

export default function ChaptersPage() {
  const domainContext = useDomainContext()
  const { t } = useI18n(domainContext.currentLang)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const host = window.location.host
        const project = getProject(host)
        const res = await fetch(`https://api.wikipeoplestats.org/v1/chapters/${project}`)
        const data = await res.json()

        const formattedData = data.map((item: any) => ({
          ...item,
          stats: item.stats || {
            totalPeople: 0,
            totalWomen: 0,
            totalMen: 0,
            otherGenders: 0,
            last_updated: ""
          },
          group_description: item.group_description ?? "–"
        }))

        setChapters(formattedData)
      } catch (error) {
        console.error("Failed to load chapters:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChapters()
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen">
        <NoticeBanner />
        <Header currentLang={domainContext.currentLang} onLanguageChange={() => { }} />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen">
      <NoticeBanner />
      <Header currentLang={domainContext.currentLang} onLanguageChange={() => { }} />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100">
            Wikimedia Chapters
          </h1>
          <p className="text-xl text-gray-700 text-center dark:text-gray-300">
            Discover Wikimedia chapters and their communities around the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => (
            <Card key={chapter.slug} className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                {/* Banner */}
                <div
                  className="h-32 bg-cover bg-center relative rounded-t-lg"
                  style={{ backgroundImage: `url('${chapter.banner_image}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-t-lg"></div>
                  <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                    {chapter.image_credit}
                  </div>
                </div>

                {/* Avatar */}
                <div className="flex justify-center -mt-8 mb-4">
                  <div className="w-16 h-16 rounded-full p-1 shadow-xl bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800">
                    <img
                      src={chapter.avatar_image}
                      alt={`${chapter.group_name} logo`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                  <h3 className="text-xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">
                    {chapter.group_name}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center">
                    {chapter.group_description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">Admin:</span>
                      <span className="font-medium">{chapter.admin_name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">Members:</span>
                      <span className="font-medium">{chapter.members_count.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center space-x-2 col-span-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-600 dark:text-gray-400">Created:</span>
                      <span className="font-medium">{new Date(chapter.creation_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Stats Preview */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {chapter.stats.totalPeople.toLocaleString()}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">People</div>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 p-2 rounded text-center">
                      <div className="font-bold text-pink-600 dark:text-pink-400">
                        {chapter.stats.totalWomen.toLocaleString()}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Women</div>
                    </div>
                  </div>

                  <Link href={`/chapter/${chapter.slug}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      View Chapter
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {chapters.length === 0 && !loading && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No chapters found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Check back later for new Wikimedia chapters.
            </p>
          </div>
        )}
      </main>

      <Footer currentLang={domainContext.currentLang} onLanguageChange={() => { }} />
    </div>
  )
}