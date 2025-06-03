"use client"

import type React from "react"

import { useState } from "react"
import { HelpCircle, Calendar, User } from "lucide-react"
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

export default function SearchUsersPage() {
  const domainContext = useDomainContext()
  const { t } = useI18n(domainContext.currentLang)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    project: "",
    username: "",
    startDate: "",
    endDate: "",
  })
  const [wikiCreationDate, setWikiCreationDate] = useState<string>("")

  const handleProjectChange = (project: string, creationDate?: string) => {
    setFormData((prev) => ({ ...prev, project }))
    if (creationDate) {
      setWikiCreationDate(creationDate)
    }
  }

  const validateDates = (): boolean => {
    const today = new Date().toISOString().split("T")[0]

    // Validar fecha de inicio
    if (formData.startDate) {
      if (wikiCreationDate && formData.startDate < wikiCreationDate) {
        toast({
          title: "Invalid start date",
          description: `Start date must be equal or greater than the wiki creation date (${wikiCreationDate}).`,
          variant: "destructive",
        })
        return false
      }

      if (formData.startDate > today) {
        toast({
          title: "Invalid start date",
          description: "Start date cannot be greater than today.",
          variant: "destructive",
        })
        return false
      }
    }

    // Validar fecha de fin
    if (formData.endDate) {
      if (formData.startDate && formData.endDate < formData.startDate) {
        toast({
          title: "Invalid end date",
          description: "End date must be equal or greater than start date.",
          variant: "destructive",
        })
        return false
      }

      if (formData.endDate > today) {
        toast({
          title: "Invalid end date",
          description: "End date cannot be greater than today.",
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  const buildRedirectUrl = (): string => {
    const project = domainContext.needsProjectSelection ? formData.project : domainContext.currentProject

    if (!project) {
      throw new Error("No project selected")
    }

    let baseUrl = ""
    let path = "/users"

    // Caso especial para wikidatawiki
    if (project === "wikidatawiki") {
      baseUrl = "https://www.wikipeoplestats.org"
    } else {
      // Parsear el proyecto para extraer idioma y tipo
      const match = project.match(/^([a-z]{2,3})(wiki(?:quote|source|books|versity|news|data)?)$/)
      if (!match) {
        throw new Error("Invalid project format")
      }

      const lang = match[1]
      const type = match[2] === "wiki" ? "" : `.${match[2].replace("wiki", "")}`
      baseUrl = `https://${lang}${type}.wikipeoplestats.org`
    }

    // Construir la URL con nombre de usuario y fechas
    if (formData.username) {
      path += `/${encodeURIComponent(formData.username)}`

      if (formData.startDate && formData.endDate) {
        path += `/${formData.startDate}/${formData.endDate}`
      } else if (formData.startDate) {
        path += `/${formData.startDate}/`
      } else if (formData.endDate) {
        path += `//${formData.endDate}`
      }
    } else {
      // Si no hay nombre de usuario, solo añadir fechas
      if (formData.startDate && formData.endDate) {
        path += `/${formData.startDate}/${formData.endDate}`
      } else if (formData.startDate) {
        path += `/${formData.startDate}/`
      } else if (formData.endDate) {
        path += `//${formData.endDate}`
      }
    }

    return baseUrl + path
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar proyecto si es necesario
    if (domainContext.needsProjectSelection && !formData.project.trim()) {
      toast({
        title: "Project required",
        description: "Please select a valid project.",
        variant: "destructive",
      })
      return
    }

    // Validar fechas
    if (!validateDates()) {
      return
    }

    try {
      const redirectUrl = buildRedirectUrl()
      window.location.href = redirectUrl
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
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
              {t("search_users_title")}
            </h1>
            <p className="text-xl text-gray-700 text-center dark:text-gray-300 mb-6">
              {domainContext.needsProjectSelection
                ? t("search_users_intro")
                : t("search_users_in_project", domainContext.currentProject || "")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Selection - Solo mostrar si es necesario */}
                {domainContext.needsProjectSelection && (
                  <div className="md:col-span-2">
                    <ProjectAutocomplete
                      value={formData.project}
                      onChange={handleProjectChange}
                      label={t("input_project_label")}
                      placeholder={t("input_project_placeholder")}
                      required
                    />
                  </div>
                )}

                {/* Username Input */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("input_username_label")}
                    </Label>
                    <HelpCircle
                      className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help"
                      title="Enter the username to search for"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder={t("input_username_placeholder")}
                      className="pl-10 h-10"
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("input_start_date_label")}
                    </Label>
                    <HelpCircle
                      className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help"
                      title="Select the start date for user contributions"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="pl-10 h-10"
                      min={wikiCreationDate}
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
                      title="Select the end date for user contributions"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="pl-10 h-10"
                      min={formData.startDate || wikiCreationDate}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    className="w-full h-10 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {t("search_button")}
                  </Button>
                </div>
              </div>
            </form>

            {/* Información del contexto actual */}
            {!domainContext.needsProjectSelection && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {t("current_project_context", domainContext.currentProject || "")}
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">{t("project_context_description")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer currentLang={domainContext.currentLang} onLanguageChange={() => {}} />
    </div>
  )
}
