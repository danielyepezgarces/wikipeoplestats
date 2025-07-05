"use client"

import { useState } from "react"
import { HelpCircle, Calendar, Scale, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NoticeBanner } from "@/components/notice-banner"
import { ProjectAutocomplete } from "@/components/project-autocomplete"
import { useI18n } from "@/hooks/use-i18n"
import { useDomainContext } from "@/hooks/use-domain-context"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

// Add this export to prevent static generation


type CompareType = "wikis" | "users" | "countries"

interface Project {
  id: string
  value: string
  creationDate?: string
}

export default function ComparePage() {
  const router = useRouter()
  const domainContext = useDomainContext()
  const { t } = useI18n(domainContext.currentLang)
  const { toast } = useToast()

  const [compareType, setCompareType] = useState<CompareType>("wikis")
  const [projects, setProjects] = useState<Project[]>([
    { id: "project-1", value: "" },
    { id: "project-2", value: "" },
  ])
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
  })

  const handleProjectChange = (id: string, value: string, creationDate?: string) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, value, creationDate } : project
    ))
  }

  const addProject = () => {
    if (projects.length < 5) {
      setProjects(prev => [...prev, { id: `project-${prev.length + 1}`, value: "" }])
    } else {
      toast({
        title: t("max_projects_reached_title"),
        description: t("max_projects_reached_description"),
        variant: "default",
      })
    }
  }

  const removeProject = (id: string) => {
    if (projects.length > 2) {
      setProjects(prev => prev.filter(project => project.id !== id))
    } else {
      toast({
        title: t("min_projects_required_title"),
        description: t("min_projects_required_description"),
        variant: "default",
      })
    }
  }

  const validateDates = (): boolean => {
    const today = new Date().toISOString().split("T")[0]

    if (formData.startDate) {
      const latestCreationDate = projects
        .map(p => p.creationDate || "")
        .filter(Boolean)
        .sort()
        .pop()

      if (latestCreationDate && formData.startDate < latestCreationDate) {
        toast({
          title: t("invalid_start_date_title"),
          description: t("invalid_start_date_description", { date: latestCreationDate }),
          variant: "destructive",
        })
        return false
      }

      if (formData.startDate > today) {
        toast({
          title: t("invalid_start_date_future_title"),
          description: t("invalid_start_date_future_description"),
          variant: "destructive",
        })
        return false
      }
    }

    if (formData.endDate) {
      if (formData.startDate && formData.endDate < formData.startDate) {
        toast({
          title: t("invalid_end_date_title"),
          description: t("invalid_end_date_description"),
          variant: "destructive",
        })
        return false
      }

      if (formData.endDate > today) {
        toast({
          title: t("invalid_end_date_future_title"),
          description: t("invalid_end_date_future_description"),
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  const validateProjects = (): boolean => {
    const validProjects = projects.filter(p => p.value.trim()).length
    if (validProjects < 2) {
      toast({
        title: t("invalid_projects_title"),
        description: t("invalid_projects_description"),
        variant: "destructive",
      })
      return false
    }

    const uniqueProjects = new Set(projects.map(p => p.value).filter(Boolean))
    if (uniqueProjects.size !== validProjects) {
      toast({
        title: t("duplicate_projects_title"),
        description: t("duplicate_projects_description"),
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const buildRedirectUrl = (): string => {
    const baseUrl = "https://www.wikipeoplestats.org"
    let path = `/compare/${compareType}`

    const projectCodes = projects
      .map(p => p.value)
      .filter(Boolean)
      .join(",")

    path += `/${encodeURIComponent(projectCodes)}`

    if (formData.startDate && formData.endDate) {
      path += `/${formData.startDate}/${formData.endDate}`
    } else if (formData.startDate) {
      path += `/${formData.startDate}/`
    } else if (formData.endDate) {
      path += `//${formData.endDate}`
    }

    return baseUrl + path
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateProjects() || !validateDates()) {
      return
    }

    try {
      const redirectUrl = buildRedirectUrl()
      router.push(redirectUrl)
    } catch (error) {
      toast({
        title: t("error_title"),
        description: error instanceof Error ? error.message : t("generic_error"),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-[#0D161C] text-gray-800 dark:text-gray-200 transition-colors duration-300 min-h-screen">
      <NoticeBanner />
      <Header currentLang={domainContext.currentLang} onLanguageChange={() => {}} />

      <main className="container mx-auto px-4 py-8">
        <Card className="bg-white dark:bg-gray-800 shadow-md">
          <CardContent className="p-6">
            <h1 className="text-3xl text-center font-bold mb-4 text-gray-900 dark:text-gray-100">
              {t("compare_title")}
            </h1>
            <p className="text-xl text-gray-700 text-center dark:text-gray-300 mb-6">{t("compare_intro")}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Compare Type Selector */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="compare_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("compare_type_label")}
                  </Label>
                  <HelpCircle
                    className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help"
                    title={t("compare_type_help")}
                  />
                </div>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select
                    value={compareType}
                    onValueChange={(value) => setCompareType(value as CompareType)}
                  >
                    <SelectTrigger className="pl-10 h-10">
                      <SelectValue placeholder={t("select_compare_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wikis">{t("compare_wikis")}</SelectItem>
                      <SelectItem value="users">{t("compare_users")}</SelectItem>
                      <SelectItem value="countries">{t("compare_countries")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Projects to Compare */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {compareType === "wikis"
                        ? t("compare_projects_label")
                        : compareType === "users"
                          ? t("compare_users_label")
                          : t("compare_countries_label")}
                    </Label>
                    <HelpCircle
                      className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help"
                      title={t("compare_items_help")}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProject}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t("add_more")}</span>
                  </Button>
                </div>

                {projects.map((project, index) => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <ProjectAutocomplete
                        value={project.value}
                        onChange={(value, creationDate) => handleProjectChange(project.id, value, creationDate)}
                        label={`${t(compareType === "wikis" ? "project" : compareType === "users" ? "user" : "country")} ${index + 1}`}
                        placeholder={t(`input_${compareType.slice(0, -1)}_placeholder`)}
                        required
                        compareType={compareType}
                      />
                    </div>
                    {projects.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProject(project.id)}
                        className="mt-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("input_start_date_label")}
                    </Label>
                    <HelpCircle
                      className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help"
                      title={t("start_date_help")}
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="pl-10 h-10"
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("input_end_date_label")}
                    </Label>
                    <HelpCircle
                      className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help"
                      title={t("end_date_help")}
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="pl-10 h-10"
                      min={formData.startDate}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {t("compare_button")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer currentLang={domainContext.currentLang} onLanguageChange={() => {}} />
    </div>
  )
}