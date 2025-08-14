import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export interface TourStep {
  element: string
  popover: {
    title: string
    description: string
    side?: "left" | "right" | "top" | "bottom"
    align?: "start" | "center" | "end"
  }
}

export interface Tour {
  id: string
  steps: TourStep[]
  options?: {
    showProgress?: boolean
    allowClose?: boolean
    overlayClickNext?: boolean
    smoothScroll?: boolean
  }
}

// Homepage Tour
export const homepageTour: Tour = {
  id: "homepage",
  steps: [
    {
      element: "[data-tour='welcome-section']",
      popover: {
        title: "¡Bienvenido a WikiPeopleStats!",
        description: "Esta es la página principal donde puedes ver estadísticas de género en proyectos de Wikimedia.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='stats-grid']",
      popover: {
        title: "Estadísticas de Género",
        description:
          "Aquí puedes ver el desglose de editores por género: total de personas, mujeres, hombres, otros géneros y total de editores.",
        side: "top",
      },
    },
    {
      element: "[data-tour='project-rotator']",
      popover: {
        title: "Proyectos de Wikimedia",
        description: "El texto cambia automáticamente para mostrar diferentes proyectos de Wikimedia que rastreamos.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='cache-info']",
      popover: {
        title: "Información de Caché",
        description:
          "Los datos se actualizan automáticamente. Puedes ver cuándo será la próxima actualización y forzar una actualización si es necesario.",
        side: "top",
      },
    },
    {
      element: "[data-tour='purge-button']",
      popover: {
        title: "Actualizar Datos",
        description: "Usa este botón para forzar una actualización de los datos si necesitas información más reciente.",
        side: "top",
      },
    },
  ],
  options: {
    showProgress: true,
    allowClose: true,
    smoothScroll: true,
  },
}

// Events Tour
export const eventsTour: Tour = {
  id: "events",
  steps: [
    {
      element: "[data-tour='events-header']",
      popover: {
        title: "Eventos de Wikimedia",
        description: "Aquí puedes encontrar todos los eventos y editatones organizados por la comunidad de Wikimedia.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='active-events']",
      popover: {
        title: "Eventos Activos",
        description: "Estos son los eventos que están ocurriendo ahora mismo. ¡Puedes participar en ellos!",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='event-card']",
      popover: {
        title: "Tarjeta de Evento",
        description:
          "Cada tarjeta muestra información del evento: fechas, ubicación, número de participantes y descripción.",
        side: "right",
      },
    },
    {
      element: "[data-tour='event-actions']",
      popover: {
        title: "Acciones del Evento",
        description: "Puedes ver los detalles del evento o visitar la página oficial del evento en Wikimedia.",
        side: "top",
      },
    },
  ],
  options: {
    showProgress: true,
    allowClose: true,
    smoothScroll: true,
  },
}

// Navigation Tour
export const navigationTour: Tour = {
  id: "navigation",
  steps: [
    {
      element: "[data-tour='header']",
      popover: {
        title: "Navegación Principal",
        description: "Desde aquí puedes navegar por toda la aplicación y cambiar el idioma.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='language-selector']",
      popover: {
        title: "Selector de Idioma",
        description: "Cambia el idioma de la interfaz. Soportamos múltiples idiomas según el proyecto de Wikimedia.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='user-menu']",
      popover: {
        title: "Menú de Usuario",
        description: "Si has iniciado sesión, aquí puedes acceder a tu perfil, dashboard y configuraciones.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='events-link']",
      popover: {
        title: "Enlace a Eventos",
        description: "Haz clic aquí para ver todos los eventos y editatones disponibles.",
        side: "bottom",
      },
    },
  ],
  options: {
    showProgress: true,
    allowClose: true,
    smoothScroll: true,
  },
}

// Event Detail Tour
export const eventDetailTour: Tour = {
  id: "event-detail",
  steps: [
    {
      element: "[data-tour='event-header']",
      popover: {
        title: "Información del Evento",
        description:
          "Aquí puedes ver toda la información detallada del evento: nombre, fechas, ubicación y descripción.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='event-stats']",
      popover: {
        title: "Estadísticas del Evento",
        description:
          "Estas estadísticas muestran el impacto del evento: participantes por género y contribuciones totales.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='countdown']",
      popover: {
        title: "Contador de Tiempo",
        description: "Si el evento está activo, verás un contador que muestra cuánto tiempo queda para que termine.",
        side: "top",
      },
    },
    {
      element: "[data-tour='participants-button']",
      popover: {
        title: "Ver Participantes",
        description:
          "Haz clic aquí para ver la lista completa de participantes del evento con enlaces a sus perfiles de Wikipedia.",
        side: "top",
      },
    },
  ],
  options: {
    showProgress: true,
    allowClose: true,
    smoothScroll: true,
  },
}

// Tour Manager Class
export class TourManager {
  private static instance: TourManager
  private currentTour: any = null

  static getInstance(): TourManager {
    if (!TourManager.instance) {
      TourManager.instance = new TourManager()
    }
    return TourManager.instance
  }

  startTour(tour: Tour) {
    if (this.currentTour) {
      this.currentTour.destroy()
    }

    this.currentTour = driver({
      showProgress: tour.options?.showProgress ?? true,
      allowClose: tour.options?.allowClose ?? true,
      overlayClickNext: tour.options?.overlayClickNext ?? false,
      smoothScroll: tour.options?.smoothScroll ?? true,
      steps: tour.steps.map((step) => ({
        element: step.element,
        popover: {
          title: step.popover.title,
          description: step.popover.description,
          side: step.popover.side || "bottom",
          align: step.popover.align || "start",
        },
      })),
    })

    this.currentTour.drive()
  }

  stopTour() {
    if (this.currentTour) {
      this.currentTour.destroy()
      this.currentTour = null
    }
  }

  isActive(): boolean {
    return this.currentTour !== null
  }
}

// Hook for using tours
export const useTours = () => {
  const tourManager = TourManager.getInstance()

  const startHomepageTour = () => tourManager.startTour(homepageTour)
  const startEventsTour = () => tourManager.startTour(eventsTour)
  const startNavigationTour = () => tourManager.startTour(navigationTour)
  const startEventDetailTour = () => tourManager.startTour(eventDetailTour)
  const stopTour = () => tourManager.stopTour()

  return {
    startHomepageTour,
    startEventsTour,
    startNavigationTour,
    startEventDetailTour,
    stopTour,
    isActive: tourManager.isActive(),
  }
}
