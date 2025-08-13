import type { WikiEvent } from "@/types/events"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Info, Users, ExternalLink } from "lucide-react"
import Image from "next/image"

interface EventHeaderProps {
  event: WikiEvent
  participantsCount: number
}

export default function EventHeader({ event, participantsCount }: EventHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        {/* Event Image */}
        {event.event_image && (
          <div className="relative aspect-[16/3] mb-6 rounded-lg overflow-hidden">
            <Image
              src={event.event_image || "/placeholder.svg"}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <h1 className="text-3xl font-bold text-center mb-6">{event.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Dates */}
          <div className="flex items-center space-x-4 p-4 border-b md:border-b-0 md:border-r border-border">
            <Calendar className="text-blue-500 text-xl flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Fechas del Evento</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(event.start_date)}
                {event.start_date !== event.end_date && <> - {formatDate(event.end_date)}</>}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-4 p-4 border-b md:border-b-0 md:border-r border-border">
            <MapPin className="text-green-500 text-xl flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Ubicación</h3>
              <p className="text-sm text-muted-foreground">{event.location}</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start space-x-4 p-4 border-b md:border-b-0 md:border-r border-border">
            <Info className="text-purple-500 text-xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Descripción</h3>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-start space-x-4 p-4">
            <Users className="text-purple-500 text-xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Participantes</h3>
              <p className="text-sm text-muted-foreground cursor-pointer hover:underline">
                {participantsCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Button asChild>
            <a href={event.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visitar Evento
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
