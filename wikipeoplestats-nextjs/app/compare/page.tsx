"use client"

import type React from "react"

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

export default function ComparePage() {
  const domainContext = useDomainContext()
  const { t } = useI18n(domainContext.currentLang)
  const { toast } = useToast()

  const [compareType, setCompareType] = useState<"wikis" | "users" | "countries">("wikis")
  const [projects, setProjects] = useState<Array<{ id: string; value: string; creationDate?: string }>>([
    { id: "project-1", value: "" },
    { id: "project-2", value: "" },
  ])
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
  })

  const handleProjectChange = (id: string, value: string, creationDate?: string) => {
    setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, value, creationDate } : project)))
  }

  const addProject = () => {
    if (projects.length < 5) {
      setProjects((prev) => [...prev, { id: `project-${prev.length + 1}`, value: "" }])
    } else {
      toast({
        title: "Maximum projects reached",
        description: "You can compare up to 5 projects at once.",
        variant: "default",
      })
    }
  }

  const removeProject = (id: string) => {
    if (projects.length > 2) {
      setProjects((prev) => prev.filter((project) => project.id !== id))
    } else {
      toast({
        title: "Minimum projects required",
        description: "You need at least 2 projects to compare.",
        variant: "default",
      })
    }
  }

  const validateDates = (): boolean => {
    const today = new Date().toISOString().split("T")[0]

    // Validar fecha de inicio
    if (formData.startDate) {
      // Encontrar la fecha de creación más reciente entre todos los proyectos
      const latestCreationDate = projects
        .map((p) => p.creationDate || "")
        .filter(Boolean)
        .sort()
        .pop()

      if (latestCreationDate && formData.startDate < latestCreationDate) {
        toast({
          title: "Invalid start date",
          description: `Start date must be equal or greater than the latest wiki creation date (${latestCreationDate}).`,
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

  const validateProjects = (): boolean => {
    // Verificar que al menos dos proyectos tengan valores
    const validProjects = projects.filter((p) => p.value.trim()).length
    if (validProjects < 2) {
      toast({
        title: "Invalid projects",
        description: "You need to select at least 2 projects to compare.",
        variant: "destructive",
      })
      return false
    }

    // Verificar que no haya proyectos duplicados
    const uniqueProjects = new Set(projects.map((p) => p.value).filter(Boolean))
    if (uniqueProjects.size !== validProjects) {
      toast({
        title: "Duplicate projects",
        description: "You cannot compare the same project multiple times.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const buildRedirectUrl = (): string => {
    // Base URL siempre es el dominio principal para comparaciones
    const baseUrl = "https://www.wikipeoplestats.org"

    // Construir la ruta de comparación
    let path = `/compare/${compareType}`

    // Añadir los proyectos a la URL
    const projectCodes = projects
      .map((p) => p.value)
      .filter(Boolean)
      .join(",")

    path += `/${encodeURIComponent(projectCodes)}`

    // Añadir fechas si están presentes
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

    // Validar proyectos
    if (!validateProjects()) {
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
                    title="Select what you want to compare"
                  />
                </div>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select
                    value={compareType}
                    onValueChange={(value) => setCompareType(value as "wikis" | "users" | "countries")}
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
                      title={`Select ${compareType} to compare`}
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
                        label={`${compareType === "wikis" ? t("project") : compareType === "users" ? t("user") : t("country")} ${index + 1}`}
                        placeholder={t(`input_${compareType.slice(0, -1)}_placeholder`)}
                        required
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
                      title="Select the start date for comparison"
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
                      title="Select the end date for comparison"
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
