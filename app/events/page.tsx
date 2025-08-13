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
import { events } from "@/lib/events-data"
import Link from "next/link"
import Image from "next/image"

interface Event {
  id: number
  slug: string
  name: string
  description: string
  start_date: string
  end_date: string
  location: string
  url: string
  event_image?: string
  wikis: string[]
  status: "active" | "past" | "upcoming"
  participants_count?: number
}

export default function EventsPage() {
  const domainContext = useDomainContext()
  const { t } = useI18n(domainContext.currentLang)
  const [processedEvents, setProcessedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processEvents = async () => {
      try {
        setLoading(true)
        setError(null)

        const currentDate = new Date()
        const eventsWithStatus = events.map((event) => {
          const startDate = new Date(event.start_date)
          const endDate = new Date(event.end_date)

          let status: "active" | "past" | "upcoming" = "upcoming"
          if (currentDate >= startDate && currentDate <= endDate) {
            status = "active"
          } else if (currentDate > endDate) {
            status = "past"
          }

          return {
            ...event,
            status,
            participants_count: Math.floor(Math.random() * 200) + 50, // Mock participant count
          }
        })

        setProcessedEvents(eventsWithStatus)
      } catch (err) {
        console.error("Error processing events:", err)
        setError(err instanceof Error ? err.message : "Failed to load events")
      } finally {
        setLoading(false)
      }
    }

    processEvents()
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

  const activeEvents = processedEvents.filter((event) => event.status === "active")
  const pastEvents = processedEvents.filter((event) => event.status === "past")
  const upcomingEvents = processedEvents.filter((event) => event.status === "upcoming")

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
        {activeEvents.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
              {t("active_events") || "Eventos Activos"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeEvents.map((event) => renderEventCard(event))}
            </div>
          </section>
        )}

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
              {t("upcoming_events") || "Próximos Eventos"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => renderEventCard(event))}
            </div>
          </section>
        )}

        {/* Past Events Section */}
        {pastEvents.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
              {t("past_events") || "Eventos Pasados"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event) => renderEventCard(event, true))}
            </div>
          </section>
        )}

        {/* No events message */}
        {processedEvents.length === 0 && (
          <div className="text-center text-xl text-gray-600 dark:text-gray-400 py-16">
            {t("no_events_available") || "No hay eventos disponibles en este momento"}
          </div>
        )}
      </main>

      <Footer currentLang={domainContext.currentLang} onLanguageChange={() => {}} />
    </div>
  )
}
