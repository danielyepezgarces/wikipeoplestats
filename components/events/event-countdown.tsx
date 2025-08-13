"use client"

import { useState, useEffect } from "react"
import type { WikiEvent } from "@/types/events"
import { Card, CardContent } from "@/components/ui/card"

interface EventCountdownProps {
  event: WikiEvent
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function EventCountdown({ event }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [eventStatus, setEventStatus] = useState<string>("")
  const [targetDate, setTargetDate] = useState<Date | null>(null)

  useEffect(() => {
    const now = new Date()
    const startDate = new Date(`${event.start_date}T00:00:00Z`)
    const endDate = new Date(`${event.end_date}T23:59:59Z`)

    let status = ""
    let target: Date | null = null

    if (now < startDate) {
      status = "El evento aún no ha comenzado"
      target = startDate
    } else if (now >= startDate && now <= endDate) {
      status = "El evento está en progreso"
      target = endDate
    } else {
      status = "El evento ha terminado"
      target = null
    }

    setEventStatus(status)
    setTargetDate(target)
  }, [event.start_date, event.end_date])

  useEffect(() => {
    if (!targetDate) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <Card className="mb-8">
      <CardContent className="p-6 text-center">
        <p className="text-lg font-semibold mb-4">{eventStatus}</p>

        {targetDate && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <span className="text-3xl font-bold block">{timeLeft.days.toString().padStart(2, "0")}</span>
              <span className="text-sm text-muted-foreground">Días</span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold block">{timeLeft.hours.toString().padStart(2, "0")}</span>
              <span className="text-sm text-muted-foreground">Horas</span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold block">{timeLeft.minutes.toString().padStart(2, "0")}</span>
              <span className="text-sm text-muted-foreground">Minutos</span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold block">{timeLeft.seconds.toString().padStart(2, "0")}</span>
              <span className="text-sm text-muted-foreground">Segundos</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
