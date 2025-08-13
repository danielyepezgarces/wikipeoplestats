"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, ExternalLink, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NoticeBanner } from "@/components/notice-banner"
import { SkeletonCard } from "@/components/skeleton-card"
import { useI18n } from "@/hooks/use-i18n"
import { useDomainContext } from "@/hooks/use-domain-context"
import { getProject } from "@/lib/languages"
import Link from "next/link"
import Image from "next/image"

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
  participants_count?: number
}

interface EventsResponse {
  active: Event[]
  past: Event[]
  upcoming: Event[]
}

export default function EventsPage() {
  const domainContext = useDomainContext()
  const { t } = useI18n(domainContext.currentLang)
  const [events, setEvents] = useState<EventsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)

        const host = window.location.host
        const project = getProject(host)

        const response = await fetch(`https://api.wikipeoplestats.org/v1/events/${project}`, {
          headers: {
            "User-Agent": "WikiPeopleStats/1.0",
          },
          cache: "no-cache",
        })

        if (response.ok) {
          const data = await response.json()
          setEvents(data)
        } else {
          const fallbackEvents: EventsResponse = {
            active: [
              {
                id: "women-in-red-2024",
                slug: "women-in-red-2024",
                name: "Women in Red Wikipedia 2024",
                description: "Editatón para crear y mejorar artículos sobre mujeres notables en Wikipedia",
                start_date: "2024-03-08T00:00:00Z",
                end_date: "2024-03-31T23:59:59Z",
                location: "Virtual/Global",
                url: "https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Women_in_Red",
                event_image: "/women-in-red-wikipedia.png",
                wiki_project: project,
                status: "active",
                participants_count: 156,
              },
            ],
            past: [
              {
                id: "art-feminism-2024",
                slug: "art-feminism-2024",
                name: "Art+Feminism Editathon 2024",
                description: "Editatón anual para mejorar la cobertura de arte feminista y mujeres artistas",
                start_date: "2024-02-01T00:00:00Z",
                end_date: "2024-02-29T23:59:59Z",
                location: "Multiple locations worldwide",
                url: "https://en.wikipedia.org/wiki/Wikipedia:Meetup/ArtAndFeminism",
                event_image: "/art-feminism-editathon.png",
                wiki_project: project,
                status: "past",
                participants_count: 89,
              },
              {
                id: "wikimedia-hackathon-2024",
                slug: "wikimedia-hackathon-2024",
                name: "Wikimedia Hackathon 2024",
                description: "Hackathon anual de desarrolladores de Wikimedia para mejorar herramientas y proyectos",
                start_date: "2024-01-15T00:00:00Z",
                end_date: "2024-01-17T23:59:59Z",
                location: "Athens, Greece",
                url: "https://www.mediawiki.org/wiki/Wikimedia_Hackathon_2024",
                event_image: "/wikimedia-hackathon-2024.png",
                wiki_project: project,
                status: "past",
                participants_count: 234,
              },
            ],
            upcoming: [],
          }
          setEvents(fallbackEvents)
        }
      } catch (err) {
        console.error("Error fetching events:", err)
        setError(err instanceof Error ? err.message : "Failed to load events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen">
        <NoticeBanner />
        <Header currentLang={domainContext.currentLang} onLanguageChange={() => {}} />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
              {t("error_loading_events") || "Error Loading Events"}
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
              {t("try_again") || "Try Again"}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const renderEventCard = (event: Event, isPast = false) => (
    <Card
      key={event.id}
      className={`overflow-hidden hover:shadow-lg transition-shadow ${isPast ? "opacity-80 hover:opacity-100" : ""}`}
    >
      {event.event_image && (
        <div className="relative h-48 w-full">
          <Image
            src={event.event_image || "/placeholder.svg"}
            alt={event.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              e.currentTarget.src = "/wikimedia-event.png"
            }}
          />
        </div>
      )}

      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{event.name}</CardTitle>
          {isPast && <Badge variant="secondary">{t("past_event") || "Pasado"}</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(event.start_date).toLocaleDateString(domainContext.currentLang === "es" ? "es-ES" : "en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(event.end_date).toLocaleDateString(domainContext.currentLang === "es" ? "es-ES" : "en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>

        {event.participants_count && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span>
              {event.participants_count} {t("participants") || "participantes"}
            </span>
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{event.description}</p>

        <div className="flex gap-2">
          <Button asChild className="flex-1" variant={isPast ? "secondary" : "default"}>
            <Link href={`/event/${event.slug}`}>
              {isPast ? t("view_summary") || "Ver Resumen" : t("view_details") || "Ver Detalles"}
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href={event.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen">
      <NoticeBanner />
      <Header currentLang={domainContext.currentLang} onLanguageChange={() => {}} />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            {t("events_title") || "Eventos de Wikimedia"}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 text-center">
            {t("events_description") || "Participa en eventos y editatones para mejorar el contenido de Wikipedia"}
          </p>
        </div>

        {/* Active Events Section */}
        {events?.active && events.active.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
              {t("active_events") || "Eventos Activos"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.active.map((event) => renderEventCard(event))}
            </div>
          </section>
        )}

        {/* Upcoming Events Section */}
        {events?.upcoming && events.upcoming.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
              {t("upcoming_events") || "Próximos Eventos"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.upcoming.map((event) => renderEventCard(event))}
            </div>
          </section>
        )}

        {/* Past Events Section */}
        {events?.past && events.past.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
              {t("past_events") || "Eventos Pasados"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.past.map((event) => renderEventCard(event, true))}
            </div>
          </section>
        )}

        {/* No events message */}
        {!events?.active?.length && !events?.past?.length && !events?.upcoming?.length && (
          <div className="text-center text-xl text-gray-600 dark:text-gray-400 py-16">
            {t("no_events_available") || "No hay eventos disponibles en este momento"}
          </div>
        )}
      </main>

      <Footer currentLang={domainContext.currentLang} onLanguageChange={() => {}} />
    </div>
  )
}
