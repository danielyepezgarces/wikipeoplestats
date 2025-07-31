"use client"

import { useState, useEffect } from "react"
import { getProject, getLanguageByCode } from "@/lib/languages"

interface DomainContext {
  isMainDomain: boolean
  currentProject: string | null
  currentLang: string
  needsProjectSelection: boolean
  domain: string
}

export function useDomainContext(): DomainContext {
  const [context, setContext] = useState<DomainContext>({
    isMainDomain: true,
    currentProject: null,
    currentLang: "en",
    needsProjectSelection: true,
    domain: "",
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const host = window.location.host
    const parts = host.split(".")

    // Detectar si es el dominio principal
    const isMainDomain = host === "www.wikipeoplestats.org" || host === "wikipeoplestats.org"

    let currentProject: string | null = null
    let currentLang = "en"
    let needsProjectSelection = true

    if (!isMainDomain && parts.length >= 3) {
      // Estamos en un subdominio específico
      const langCode = parts[0]
      const projectType = parts[1]

      // Verificar si el idioma es válido
      const language = getLanguageByCode(langCode)
      if (language) {
        currentLang = langCode
        currentProject = getProject(host)
        needsProjectSelection = false
      }
    } else if (isMainDomain) {
      // Dominio principal - detectar idioma de cookies o usar inglés por defecto
      const globalUsage = document.cookie.includes("global_usage=true")
      if (globalUsage) {
        const userLangMatch = document.cookie.match(/user_language=([^;]+)/)
        if (userLangMatch) {
          currentLang = userLangMatch[1]
        }
      }
    }

    setContext({
      isMainDomain,
      currentProject,
      currentLang,
      needsProjectSelection,
      domain: host,
    })
  }, [])

  return context
}
