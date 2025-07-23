"use client"

import { use, useState, useEffect } from "react"
import { Users, UserCheck, User, EqualIcon as Genderless, Calendar, MapPin, X } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { SkeletonCard } from "@/components/skeleton-card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NoticeBanner } from "@/components/notice-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/hooks/use-i18n"
import { useDomainContext } from "@/hooks/use-domain-context"
import { notFound } from "next/navigation"

interface ChapterPageProps {
  params: Promise<{
    slug: string
  }>
}

interface Member {
  username: string
  join_date: string
  member_type: string
}

interface Chapter {
  slug: string
  group_name: string
  admin_name: string
  members_count: number
  group_description: string
  creation_date: string
  banner_image: string
  avatar_image: string
  image_credit: string
  members: Member[]
  stats: {
    totalPeople: number
    totalWomen: number
    totalMen: number
    otherGenders: number
    last_updated: string
  }
}

interface ChartData {
  year: string
  month: string
  total: number
  totalWomen: number
  totalMen: number
  otherGenders: number
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const resolvedParams = use(params)
  const domainContext = useDomainContext()
  const { t } = useI18n(domainContext.currentLang)
  
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isCumulative, setIsCumulative] = useState(false)
  const [chart, setChart] = useState<any>(null)

  useEffect(() => {
    const fetchChapter = async () => {
      // Mock data - replace with actual API call
      const mockChapters: { [key: string]: Chapter } = {
        "wikimedia-argentina": {
          slug: "wikimedia-argentina",
          group_name: "Wikimedia Argentina",
          admin_name: "Daniel YG",
          members_count: 125,
          group_description: "Wikimedia Argentina promueve la educación y el acceso a la cultura",
          creation_date: "2024-01-01",
          banner_image: "https://wikimedia.org.ar/wp-content/uploads/2022/01/Marcha_del_orgullo_parana_2019_16-scaled.jpg",
          avatar_image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Wikimedia_Argentina_logo_white.svg",
          image_credit: "© Paula Kindsvater (CC-BY-SA 4.0)",
          members: [
            { username: "Usuario 1", join_date: "2023-01-01", member_type: "Afiliado" },
            { username: "Usuario 2", join_date: "2023-02-15", member_type: "Socio" },
            { username: "Usuario 3", join_date: "2023-03-30", member_type: "Afiliado" },
            { username: "Usuario 4", join_date: "2023-04-12", member_type: "Socio" },
            { username: "Usuario 5", join_date: "2023-05-25", member_type: "Afiliado" },
          ],
          stats: {
            totalPeople: 342,
            totalWomen: 128,
            totalMen: 198,
            otherGenders: 16,
            last_updated: new Date().toISOString()
          }
        }
      }

      const foundChapter = mockChapters[resolvedParams.slug]
      if (!foundChapter) {
        notFound()
        return
      }

      setChapter(foundChapter)
      
      // Mock chart data
      const mockChartData: ChartData[] = [
        { year: "2023", month: "01", total: 10, totalWomen: 3, totalMen: 6, otherGenders: 1 },
        { year: "2023", month: "02", total: 15, totalWomen: 5, totalMen: 9, otherGenders: 1 },
        { year: "2023", month: "03", total: 22, totalWomen: 8, totalMen: 12, otherGenders: 2 },
        { year: "2023", month: "04", total: 30, totalWomen: 12, totalMen: 16, otherGenders: 2 },
        { year: "2023", month: "05", total: 45, totalWomen: 18, totalMen: 24, otherGenders: 3 }
      ]
      
      setChartData(mockChartData)
      setLoading(false)
    }

    fetchChapter()
  }, [resolvedParams.slug])

  useEffect(() => {
    if (chartData.length > 0) {
      createChart()
    }
  }, [chartData, isCumulative])

  const createChart = async () => {
    if (typeof window === "undefined" || chartData.length === 0) return

    try {
      const ApexCharts = (await import("apexcharts")).default

      if (chart) {
        chart.destroy()
      }

      const isDarkMode = document.documentElement.classList.contains("dark")

      const options = {
        chart: {
          type: "line",
          height: 400,
          toolbar: { show: true },
          zoom: { enabled: true },
          background: "transparent"
        },
        series: [
          {
            name: t("total_people"),
            data: isCumulative ? calculateCumulative(chartData, "total") : chartData.map(d => d.total),
            color: "#3b82f6"
          },
          {
            name: t("total_women"),
            data: isCumulative ? calculateCumulative(chartData, "totalWomen") : chartData.map(d => d.totalWomen),
            color: "#ec4899"
          },
          {
            name: t("total_men"),
            data: isCumulative ? calculateCumulative(chartData, "totalMen") : chartData.map(d => d.totalMen),
            color: "#1d4ed8"
          },
          {
            name: t("other_genders"),
            data: isCumulative ? calculateCumulative(chartData, "otherGenders") : chartData.map(d => d.otherGenders),
            color: "#a855f7"
          }
        ],
        xaxis: {
          categories: chartData.map(d => `${d.year}-${d.month}`),
          title: { 
            text: "Month",
            style: { color: isDarkMode ? "#d1d5db" : "#374151" }
          },
          labels: {
            style: { colors: isDarkMode ? "#d1d5db" : "#374151" }
          }
        },
        yaxis: {
          title: { 
            text: "Quantity",
            style: { color: isDarkMode ? "#d1d5db" : "#374151" }
          },
          labels: {
            style: { colors: isDarkMode ? "#d1d5db" : "#374151" }
          }
        },
        stroke: { curve: "smooth", width: 3 },
        markers: { size: 5 },
        tooltip: { 
          shared: true, 
          intersect: false,
          theme: isDarkMode ? "dark" : "light"
        },
        legend: { 
          position: "top",
          labels: {
            colors: isDarkMode ? "#d1d5db" : "#374151"
          }
        },
        grid: {
          borderColor: isDarkMode ? "#374151" : "#e5e7eb"
        },
        theme: {
          mode: isDarkMode ? "dark" : "light"
        }
      }

      const newChart = new ApexCharts(document.querySelector("#chartContainer"), options)
      await newChart.render()
      setChart(newChart)
    } catch (error) {
      console.error("Error creating chart:", error)
    }
  }

  const calculateCumulative = (data: ChartData[], key: keyof ChartData): number[] => {
    let sum = 0
    return data.map(item => {
      sum += Number(item[key])
      return sum
    })
  }

  const toggleChart = () => {
    setIsCumulative(!isCumulative)
  }

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

  if (!chapter) {
    return notFound()
  }

  const ratioWomen = chapter.stats.totalPeople > 0 ? (chapter.stats.totalWomen / chapter.stats.totalPeople) * 100 : 0
  const ratioMen = chapter.stats.totalPeople > 0 ? (chapter.stats.totalMen / chapter.stats.totalPeople) * 100 : 0
  const ratioOtherGenders = chapter.stats.totalPeople > 0 ? (chapter.stats.otherGenders / chapter.stats.totalPeople) * 100 : 0

  return (
    <div className="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen">
      <NoticeBanner />
      <Header currentLang={domainContext.currentLang} onLanguageChange={() => {}} />

      <main className="container mx-auto px-4 py-8">
        {/* Chapter Banner */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 overflow-hidden">
          <div 
            className="relative h-80 sm:h-64 w-full bg-cover bg-center"
            style={{ backgroundImage: `url('${chapter.banner_image}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-6 text-white">
              <p className="text-lg md:text-xl">{chapter.group_description}</p>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-md text-sm text-white italic">
              {chapter.image_credit}
            </div>
          </div>
          
          {/* Chapter Avatar */}
          <div className="flex justify-center -mt-16">
            <div className="w-32 h-32 sm:w-28 sm:h-28 rounded-full p-2 shadow-xl bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 z-10">
              <img 
                src={chapter.avatar_image} 
                alt={`${chapter.group_name} avatar`}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          
          {/* Chapter Info */}
          <div className="px-6 pb-8 pt-6 text-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              {chapter.group_name}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Admin</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">{chapter.admin_name}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Members</h3>
                <p 
                  className="text-lg cursor-pointer text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                  onClick={() => setShowMembersModal(true)}
                >
                  {chapter.members_count.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Created</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {new Date(chapter.creation_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                Join Chapter
              </Button>
              <Button variant="outline" className="px-6 py-3">
                View Details
              </Button>
            </div>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <StatsCard 
            icon={<Users />} 
            title={t("total_people")} 
            value={chapter.stats.totalPeople} 
            iconColor="text-blue-500" 
          />
          <StatsCard
            icon={<UserCheck />}
            title={t("total_women")}
            value={chapter.stats.totalWomen}
            percentage={ratioWomen}
            iconColor="text-pink-500"
          />
          <StatsCard
            icon={<User />}
            title={t("total_men")}
            value={chapter.stats.totalMen}
            percentage={ratioMen}
            iconColor="text-blue-700"
          />
          <StatsCard
            icon={<Genderless />}
            title={t("other_genders")}
            value={chapter.stats.otherGenders}
            percentage={ratioOtherGenders}
            iconColor="text-purple-500"
          />
        </div>
        
        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Activity Over Time
            </h2>
            <Button
              onClick={toggleChart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
            >
              {isCumulative ? "Show Normal" : "Show Cumulative"}
            </Button>
          </div>
          <div id="chartContainer" className="w-full h-96"></div>
        </div>
        
        {/* Credits */}
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-gray-800 dark:text-gray-200">
            Statistics from {chapter.group_name} - Last updated: {new Date(chapter.stats.last_updated).toLocaleString()}
          </p>
        </div>
      </main>

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b dark:border-gray-700 p-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Members List
              </h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Member Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {chapter.members.map((member, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {member.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(member.join_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {member.member_type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border-t dark:border-gray-700 p-4 text-right">
              <Button
                onClick={() => setShowMembersModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer currentLang={domainContext.currentLang} onLanguageChange={() => {}} />
    </div>
  )
}