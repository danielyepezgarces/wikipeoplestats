"use client"

import { useState, useEffect } from "react"

interface Translations {
  [key: string]: string
}

const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 horas en milisegundos

export function useI18n(locale = "en") {
  const [translations, setTranslations] = useState<Translations>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true)

        // Intentar cargar desde caché
        const cachedData = localStorage.getItem(`translations_${locale}`)
        const cachedTimestamp = localStorage.getItem(`translations_${locale}_timestamp`)

        // Verificar si la caché es válida (menos de 24 horas)
        const now = Date.now()
        const isValidCache = cachedData && cachedTimestamp && now - Number.parseInt(cachedTimestamp, 10) < CACHE_EXPIRY

        if (isValidCache) {
          console.log(`Using cached translations for ${locale}`)
          setTranslations(JSON.parse(cachedData))
          setLoading(false)
          return
        }

        // Si no hay caché válida, cargar desde el servidor
        const response = await fetch(`/locales/${locale}.json`)
        if (response.ok) {
          const data = await response.json()

          // Guardar en caché
          localStorage.setItem(`translations_${locale}`, JSON.stringify(data))
          localStorage.setItem(`translations_${locale}_timestamp`, now.toString())

          setTranslations(data)
        } else {
          // Fallback a inglés
          const fallbackResponse = await fetch("/locales/en.json")
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setTranslations(fallbackData)

            // Guardar fallback en caché
            localStorage.setItem(`translations_en`, JSON.stringify(fallbackData))
            localStorage.setItem(`translations_en_timestamp`, now.toString())
          }
        }
      } catch (error) {
        console.error("Error loading translations:", error)
        // Intentar cargar inglés como último recurso
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

    // Reemplazar %s con argumentos
    args.forEach((arg) => {
      translation = translation.replace("%s", arg)
    })

    return translation
  }

  return { t, loading, translations }
}
