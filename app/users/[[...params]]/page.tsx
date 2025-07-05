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


interface UsersPageProps {
  params: Promise<{
    params?: string[]
  }>
}

export default function UsersPage({ params }: UsersPageProps) {
  const resolvedParams = use(params)
  const domainContext = useDomainContext()
  const { t } = useI18n(domainContext.currentLang)

  // Parse parameters from URL: [username, startDate, endDate] or [startDate, endDate]
  const urlParams = resolvedParams.params || []
  let username = ""
  let startDate = ""
  let endDate = ""

  if (urlParams.length === 3) {
    // Format: /users/username/startDate/endDate
    username = urlParams[0]
    startDate = urlParams[1]
    endDate = urlParams[2]
  } else if (urlParams.length === 2) {
    // Could be: /users/username/startDate or /users/startDate/endDate
    // Check if first param looks like a date
    if (urlParams[0].match(/^\d{4}-\d{2}-\d{2}$/)) {
      startDate = urlParams[0]
      endDate = urlParams[1]
    } else {
      username = urlParams[0]
      startDate = urlParams[1]
    }
  } else if (urlParams.length === 1) {
    // Could be username or startDate
    if (urlParams[0].match(/^\d{4}-\d{2}-\d{2}$/)) {
      startDate = urlParams[0]
    } else {
      username = urlParams[0]
    }
  }

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
  const pageTitle = username ? t("user_statistics_title", username) : t("users_statistics_title")

  return (
    <div className="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen">
      <NoticeBanner />
      <Header currentLang={domainContext.currentLang} onLanguageChange={() => {}} />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100">{pageTitle}</h1>
          <p className="text-xl text-gray-700 text-center dark:text-gray-300">
            {username ? t("user_project_content", username, projectName) : t("users_project_content", projectName)}
          </p>
          {(startDate || endDate || username) && (
            <div className="mt-4 text-center space-x-2">
              {username && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {t("user")}: {username}
                </span>
              )}
              {(startDate || endDate) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {startDate && endDate
                    ? t("date_range", startDate, endDate)
                    : startDate
                      ? t("from_date", startDate)
                      : t("until_date", endDate)}
                </span>
              )}
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
