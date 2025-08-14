"use client"

import { useState } from "react"
import { HelpCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTours } from "@/lib/tours"

interface TourTriggerProps {
  page: "homepage" | "events" | "event-detail" | "navigation"
  className?: string
}

export function TourTrigger({ page, className = "" }: TourTriggerProps) {
  const [showOptions, setShowOptions] = useState(false)
  const { startHomepageTour, startEventsTour, startNavigationTour, startEventDetailTour } = useTours()

  const handleTourStart = (tourType: string) => {
    setShowOptions(false)

    switch (tourType) {
      case "homepage":
        startHomepageTour()
        break
      case "events":
        startEventsTour()
        break
      case "navigation":
        startNavigationTour()
        break
      case "event-detail":
        startEventDetailTour()
        break
    }
  }

  const getTourOptions = () => {
    switch (page) {
      case "homepage":
        return [
          {
            id: "homepage",
            label: "Tour de la Página Principal",
            description: "Aprende sobre las estadísticas y funciones principales",
          },
          { id: "navigation", label: "Tour de Navegación", description: "Conoce cómo navegar por la aplicación" },
        ]
      case "events":
        return [
          { id: "events", label: "Tour de Eventos", description: "Descubre cómo explorar y participar en eventos" },
          { id: "navigation", label: "Tour de Navegación", description: "Conoce cómo navegar por la aplicación" },
        ]
      case "event-detail":
        return [
          {
            id: "event-detail",
            label: "Tour del Evento",
            description: "Explora los detalles y estadísticas del evento",
          },
          { id: "navigation", label: "Tour de Navegación", description: "Conoce cómo navegar por la aplicación" },
        ]
      default:
        return [{ id: "navigation", label: "Tour de Navegación", description: "Conoce cómo navegar por la aplicación" }]
    }
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {showOptions && (
        <Card className="mb-4 w-80 shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">¿Necesitas ayuda?</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowOptions(false)} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Elige un tour guiado para aprender a usar la aplicación:
            </p>
            <div className="space-y-2">
              {getTourOptions().map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3 bg-transparent"
                  onClick={() => handleTourStart(option.id)}
                >
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => setShowOptions(!showOptions)}
        className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    </div>
  )
}
