"use client"

import { useState, useEffect } from "react"

interface Translations {
  [key: string]: string
}

export function useI18n(locale = "en") {
  const [translations, setTranslations] = useState<Translations>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/locales/${locale}.json`)
        if (response.ok) {
          const data = await response.json()
          setTranslations(data)
        } else {
          // Fallback to English
          const fallbackResponse = await fetch("/locales/en.json")
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setTranslations(fallbackData)
          }
        }
      } catch (error) {
        console.error("Error loading translations:", error)
        // Load English as ultimate fallback
        try {
          const fallbackResponse = await fetch("/locales/en.json")
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setTranslations(fallbackData)
          }
        } catch (fallbackError) {
          console.error("Error loading fallback translations:", fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    loadTranslations()
  }, [locale])

  const t = (key: string, ...args: string[]): string => {
    let translation = translations[key] || key

    // Replace %s placeholders with arguments
    args.forEach((arg) => {
      translation = translation.replace("%s", arg)
    })

    return translation
  }

  return { t, loading, translations }
}
