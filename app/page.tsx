"use client"

import { useState, useEffect } from "react"
import { Users, UserCheck, User, EqualIcon as Genderless, Bell, Trash2 } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { SkeletonCard } from "@/components/skeleton-card"
import { Countdown } from "@/components/countdown"
import { ProjectRotator } from "@/components/project-rotator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NoticeBanner } from "@/components/notice-banner"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/hooks/use-i18n"
import { getProject, getOriginalDomain, getLanguageByCode } from "@/lib/languages"
import { useToast } from "@/hooks/use-toast"

interface StatsData {
  totalPeople: number
  totalWomen: number
  totalMen: number
  otherGenders: number
  totalContributions: number
  lastUpdated: string
  cachedUntil: string
}

export default function HomePage() {
  const [currentLang, setCurrentLang] = useState("en")
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [purgingCache, setPurgingCache] = useState(false)
  const { t, loading: translationsLoading } = useI18n(currentLang)
  const { toast } = useToast()

  // Detectar idioma del dominio o cookies
  useEffect(() => {
    const detectLanguage = () => {
      // Verificar cookie global
      const globalUsage = document.cookie.includes("global_usage=true")
      if (globalUsage) {
        const userLangMatch = document.cookie.match(/user_language=([^;]+)/)
        if (userLangMatch) {
          setCurrentLang(userLangMatch[1])
          return
        }
      }

      // Detectar del dominio
      const host = window.location.host
      const parts = host.split(".")
      if (parts.length >= 3) {
        const langCode = parts[0]
        const language = getLanguageByCode(langCode)
        if (language) {
          setCurrentLang(langCode)
          return
        }
      }

      // Default a inglés
      setCurrentLang("en")
    }

    detectLanguage()
  }, [])

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const host = window.location.host
        const project = getProject(host)

        const response = await fetch(`https://api.wikipeoplestats.org/v1/stats/${project}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const handlePurgeCache = async () => {
    try {
      setPurgingCache(true)
      const host = window.location.host
      const project = getProject(host)

      const response = await fetch(`/api/stats/${project}`, { method: "POST" })

      if (response.ok) {
        toast({
          title: t("cache_purged_successfully"),
          variant: "default",
        })

        // Recargar después de 2 segundos
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error("Failed to purge cache")
      }
    } catch (error) {
      toast({
        title: t("cache_purge_failed"),
        variant: "destructive",
      })
    } finally {
      setPurgingCache(false)
    }
  }

  if (translationsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0D161C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const host = typeof window !== "undefined" ? window.location.host : "www.wikipeoplestats.org"
  const wikidomain = getOriginalDomain(host)
  const language = getLanguageByCode(currentLang)!

  const totalPeople = stats?.totalPeople || 0
  const totalWomen = stats?.totalWomen || 0
  const totalMen = stats?.totalMen || 0
  const otherGenders = stats?.otherGenders || 0
  const totalContributions = stats?.totalContributions || 0
  const cachedUntil = stats?.cachedUntil || new Date().toISOString()

  const ratioWomen = totalPeople > 0 ? (totalWomen / totalPeople) * 100 : 0
  const ratioMen = totalPeople > 0 ? (totalMen / totalPeople) * 100 : 0
  const ratioOtherGenders = totalPeople > 0 ? (otherGenders / totalPeople) * 100 : 0

  const hasData = totalPeople > 0 || totalWomen > 0 || totalMen > 0 || otherGenders > 0 || totalContributions > 0
  const statsCredits = hasData ? t("homepage_stats_credits", wikidomain) : t("coming_soon_tracking_wiki")

  const projects = [t("project_wikidata"), t("project_wikipedia"), t("project_wikiquote"), t("project_wikisource")]

  return (
    <div
      className={`bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen`}
      dir={language.text_direction}
    >
      <NoticeBanner />
      <Header currentLang={currentLang} onLanguageChange={setCurrentLang} />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 w-full">
          <h1 className="text-3xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100">
            {t("welcome_message")}
          </h1>
          <p className="text-xl text-gray-700 text-center justify-center dark:text-gray-300">
            <ProjectRotator projects={projects} template={t("main_home_content")} />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-8">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatsCard icon={<Users />} title={t("total_people")} value={totalPeople} iconColor="text-blue-500" />
              <StatsCard
                icon={<UserCheck />}
                title={t("total_women")}
                value={totalWomen}
                percentage={ratioWomen}
                iconColor="text-pink-500"
              />
              <StatsCard
                icon={<User />}
                title={t("total_men")}
                value={totalMen}
                percentage={ratioMen}
                iconColor="text-blue-700"
              />
              <StatsCard
                icon={<Genderless />}
                title={t("other_genders")}
                value={otherGenders}
                percentage={ratioOtherGenders}
                iconColor="text-purple-500"
              />
              <StatsCard
                icon={<Bell />}
                title={t("total_editors")}
                value={totalContributions}
                iconColor="text-green-500"
              />
            </>
          )}
        </div>

        <p className="mt-6 text-gray-900 dark:text-gray-100 text-center text-lg font-semibold bg-gray-200 dark:bg-gray-700 p-4 rounded">
          {statsCredits}
        </p>

        <div className="mt-8 text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t("cached_version_message", "")}
            <Countdown
              targetDate={cachedUntil}
              translations={{
                hours: t("hours"),
                minutes: t("minutes"),
                seconds: t("seconds"),
                updateMessage: t("cache_update_message"),
              }}
            />
          </p>
          <div className="mt-4 inline-flex items-center justify-center">
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={handlePurgeCache}
              disabled={purgingCache}
            >
              <span>{t("purge_cache_button")}</span>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <Footer currentLang={currentLang} onLanguageChange={setCurrentLang} />
    </div>
  )
}
