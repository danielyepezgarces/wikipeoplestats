"use client"

import { use, useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Calendar, MapPin, ExternalLink, Users, Clock, Trophy, Edit3 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NoticeBanner } from "@/components/notice-banner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/stats-card"
import { SkeletonCard } from "@/components/skeleton-card"
import { useI18n } from "@/hooks/use-i18n"
import { useDomainContext } from "@/hooks/use-domain-context"
import { getProject } from "@/lib/languages"

interface EventPageProps {
  params: Promise<{
    slug: string
  }>
}

interface Event {
  id: string
  slug: string
  name: string
  description: string
  start_date: string
  end_date: string
  location: string
  url: string
  event_image?: string
  wiki_project: string
  status: "active" | "past" | "upcoming"
  organizer?: string
  participants_count?: number
}

interface EventStats {
  total_edits: number
  total_articles: number
  total_bytes_added: number
  total_participants: number
  new_articles: number
  improved_articles: number
  last_updated: string
}

interface Participant {
  username: string
  edits: number
  articles_created: number
  articles_improved: number
  bytes_added: number
}

export default function EventPage({ params }: EventPageProps) {
  const resolvedParams = use(params)
  const domainContext = useDomainContext()
  const { t } = useI18n(domainContext.currentLang)

  const [event, setEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState<EventStats | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showParticipants, setShowParticipants] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true)
        setError(null)

        const host = window.location.host
        const project = getProject(host)

        const eventResponse = await fetch(
          `https://api.wikipeoplestats.org/v1/events/${project}/${resolvedParams.slug}`,
          {
            headers: {
              "User-Agent": "WikiPeopleStats/1.0",
            },
            cache: "no-cache",
          },
        )

        let eventData: Event | null = null

        if (eventResponse.ok) {
          eventData = await eventResponse.json()
        } else {
          const mockEvents: Record<string, Event> = {
            "women-in-red-2024": {
              id: "women-in-red-2024",
              slug: "women-in-red-2024",
              name: "Women in Red Wikipedia 2024",
              description:
                "Editatón global para crear y mejorar artículos sobre mujeres notables en Wikipedia. Este evento busca reducir la brecha de género en Wikipedia creando contenido sobre mujeres destacadas en diversos campos.",
              start_date: "2024-03-08T00:00:00Z",
              end_date: "2024-03-31T23:59:59Z",
              location: "Virtual/Global",
              url: "https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Women_in_Red",
              event_image: "/women-in-red-wikipedia.png",
              wiki_project: project,
              status: "active",
              organizer: "WikiProject Women in Red",
              participants_count: 156,
            },
            "art-feminism-2024": {
              id: "art-feminism-2024",
              slug: "art-feminism-2024",
              name: "Art+Feminism Editathon 2024",
              description:
                "Editatón anual para mejorar la cobertura de arte feminista y mujeres artistas en Wikipedia. Evento colaborativo que busca visibilizar el trabajo de artistas mujeres y temas relacionados con el feminismo en el arte.",
              start_date: "2024-02-01T00:00:00Z",
              end_date: "2024-02-29T23:59:59Z",
              location: "Multiple locations worldwide",
              url: "https://en.wikipedia.org/wiki/Wikipedia:Meetup/ArtAndFeminism",
              event_image: "/art-feminism-editathon.png",
              wiki_project: project,
              status: "past",
              organizer: "Art+Feminism",
              participants_count: 89,
            },
          }

          eventData = mockEvents[resolvedParams.slug] || null
        }

        if (!eventData) {
          notFound()
          return
        }

        setEvent(eventData)

        const [statsResponse, participantsResponse] = await Promise.all([
          fetch(`https://api.wikipeoplestats.org/v1/events/${project}/${resolvedParams.slug}/stats`, {
            headers: { "User-Agent": "WikiPeopleStats/1.0" },
          }).catch(() => null),
          fetch(`https://api.wikipeoplestats.org/v1/events/${project}/${resolvedParams.slug}/participants`, {
            headers: { "User-Agent": "WikiPeopleStats/1.0" },
          }).catch(() => null),
        ])

        // Handle stats
        if (statsResponse?.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        } else {
          // Mock stats based on event
          const mockStats: EventStats = {
            total_edits: eventData.slug === "women-in-red-2024" ? 1247 : 892,
            total_articles: eventData.slug === "women-in-red-2024" ? 234 : 156,
            total_bytes_added: eventData.slug === "women-in-red-2024" ? 456789 : 234567,
            total_participants: eventData.participants_count || 0,
            new_articles: eventData.slug === "women-in-red-2024" ? 89 : 67,
            improved_articles: eventData.slug === "women-in-red-2024" ? 145 : 89,
            last_updated: new Date().toISOString(),
          }
          setStats(mockStats)
        }

        // Handle participants
        if (participantsResponse?.ok) {
          const participantsData = await participantsResponse.json()
          setParticipants(participantsData)
        } else {
          // Mock participants
          const mockParticipants: Participant[] = [
            { username: "WikiEditor1", edits: 45, articles_created: 3, articles_improved: 12, bytes_added: 15678 },
            { username: "WikiEditor2", edits: 32, articles_created: 2, articles_improved: 8, bytes_added: 12345 },
            { username: "WikiEditor3", edits: 28, articles_created: 1, articles_improved: 15, bytes_added: 9876 },
          ]
          setParticipants(mockParticipants)
        }
      } catch (err) {
        console.error("Error fetching event data:", err)
        setError(err instanceof Error ? err.message : "Failed to load event data")
      } finally {
        setLoading(false)
      }
    }

    fetchEventData()
  }, [resolvedParams.slug])

  useEffect(() => {
    if (!event) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const endTime = new Date(event.end_date).getTime()
      const difference = endTime - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else {
        setTimeLeft(t("event_ended") || "Evento finalizado")
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [event, t])

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen">
        <NoticeBanner />
        <Header currentLang={domainContext.currentLang} onLanguageChange={() => {}} />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4 animate-pulse" />
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </main>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen">
        <NoticeBanner />
        <Header currentLang={domainContext.currentLang} onLanguageChange={() => {}} />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
              {t("error_loading_event") || "Error Loading Event"}
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error || t("event_not_found") || "Event not found"}</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
              {t("try_again") || "Try Again"}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen">
      <NoticeBanner />
      <Header currentLang={domainContext.currentLang} onLanguageChange={() => {}} />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 overflow-hidden">
          {event.event_image && (
            <div
              className="relative h-80 sm:h-64 w-full bg-cover bg-center"
              style={{ backgroundImage: `url('${event.event_image}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
                <p className="text-lg">{event.description}</p>
              </div>
              {event.status === "active" && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-600 text-white">{t("active") || "Activo"}</Badge>
                </div>
              )}
            </div>
          )}

          {/* Event details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("duration") || "Duración"}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("location") || "Ubicación"}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{event.location}</p>
                </div>
              </div>

              {event.organizer && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("organizer") || "Organizador"}</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{event.organizer}</p>
                  </div>
                </div>
              )}

              {event.status === "active" && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("time_left") || "Tiempo restante"}</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{timeLeft}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <a href={event.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("visit_event_page") || "Visitar página del evento"}
                </a>
              </Button>
              {participants.length > 0 && (
                <Button variant="outline" onClick={() => setShowParticipants(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  {t("view_participants") || "Ver participantes"} ({participants.length})
                </Button>
              )}
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <StatsCard
              icon={<Edit3 />}
              title={t("total_edits") || "Ediciones totales"}
              value={stats.total_edits}
              iconColor="text-blue-500"
            />
            <StatsCard
              icon={<Trophy />}
              title={t("articles_created") || "Artículos creados"}
              value={stats.new_articles}
              iconColor="text-green-500"
            />
            <StatsCard
              icon={<Users />}
              title={t("participants") || "Participantes"}
              value={stats.total_participants}
              iconColor="text-purple-500"
            />
            <StatsCard
              icon={<Calendar />}
              title={t("articles_improved") || "Artículos mejorados"}
              value={stats.improved_articles}
              iconColor="text-orange-500"
            />
          </div>
        )}

        {showParticipants && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center border-b dark:border-gray-700 p-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {t("participants_list") || "Lista de participantes"}
                </h3>
                <Button variant="ghost" onClick={() => setShowParticipants(false)}>
                  ✕
                </Button>
              </div>

              <div className="overflow-y-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("username") || "Usuario"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("edits") || "Ediciones"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("articles_created") || "Creados"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("articles_improved") || "Mejorados"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {participants.map((participant, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {participant.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {participant.edits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {participant.articles_created}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {participant.articles_improved}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer currentLang={domainContext.currentLang} onLanguageChange={() => {}} />
    </div>
  )
}
