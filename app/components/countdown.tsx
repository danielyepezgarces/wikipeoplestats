"use client"

import { useState, useEffect } from "react"

interface CountdownProps {
  targetDate: string
  translations: {
    hours: string
    minutes: string
    seconds: string
    updateMessage: string
  }
}

export function Countdown({ targetDate, translations }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const target = new Date(targetDate).getTime()

    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = target - now

      if (distance < 0) {
        setTimeLeft(null)
        return
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  if (!timeLeft) {
    return <span>{translations.updateMessage}</span>
  }

  return (
    <span>
      {timeLeft.hours} {translations.hours}, {timeLeft.minutes} {translations.minutes}, {timeLeft.seconds}{" "}
      {translations.seconds}
    </span>
  )
}
