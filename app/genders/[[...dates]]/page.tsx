"use client"

import { use } from "react"
import { Users, UserCheck, User, EqualIcon as Genderless } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { SkeletonCard } from "@/components/skeleton-card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NoticeBanner } from "@/components/notice-banner"
import { HighchartsWrapper } from "@/components/highcharts-wrapper"
import { useI18n } from "@/hooks/use-i18n"
import { useDomainContext } from "@/hooks/use-domain-context"
import { useStatsData } from "@/hooks/use-stats-data"
import { getOriginalDomain } from "@/lib/languages"

interface GendersPageProps {
  params: Promise<{
    dates?: string[]
  }>
}

export default function GendersPage({ params }: GendersPageProps) {
  const resolvedParams = use(params)
  const domainContext = useDomainContext()
  const { t } = useI18n(domainContext.currentLang)

  // Parse dates from URL
  const dates = resolvedParams.dates || []
  const startDate = dates[0] || ""
  const endDate = dates[1] || ""

  const { statsData, graphData, loading, error } = useStatsData(startDate, endDate)

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

  const totalPeople = statsData?.totalPeople || 0
  const totalWomen = statsData?.totalWomen || 0
  const totalMen = statsData?.totalMen || 0
  const otherGenders = statsData?.otherGenders || 0

  const ratioWomen = totalPeople > 0 ? (totalWomen / totalPeople) * 100 : 0
  const ratioMen = totalPeople > 0 ? (totalMen / totalPeople) * 100 : 0
  const ratioOtherGenders = totalPeople > 0 ? (otherGenders / totalPeople) * 100 : 0

  const hasData = totalPeople > 0 || totalWomen > 0 || totalMen > 0 || otherGenders > 0
  const wikidomain = getOriginalDomain(domainContext.domain)
  const statsCredits = hasData ? t("homepage_stats_credits", wikidomain) : t("coming_soon_tracking_wiki")

  const projectName = domainContext.currentProject || "WikiData"

  return (
    <div className="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen">
      <NoticeBanner />
      <Header currentLang={domainContext.currentLang} onLanguageChange={() => {}} />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100">
            {t("welcome_project_message", projectName)}
          </h1>
          <p className="text-xl text-gray-700 text-center dark:text-gray-300">
            {t("main_project_content", projectName)}
          </p>
          {(startDate || endDate) && (
            <div className="mt-4 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {startDate && endDate
                  ? t("date_range", startDate, endDate)
                  : startDate
                    ? t("from_date", startDate)
                    : t("until_date", endDate)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
        </div>

        <HighchartsWrapper data={graphData} currentLang={domainContext.currentLang} projectName={projectName} />

        <div className="mt-8 text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-700 p-4 rounded">
            {statsCredits}
          </p>
          {statsData?.lastUpdated && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("last_updated")}: {new Date(statsData.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </main>

      <Footer currentLang={domainContext.currentLang} onLanguageChange={() => {}} />
    </div>
  )
}
