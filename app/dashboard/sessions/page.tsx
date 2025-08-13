import type { Metadata } from "next"
import { SessionManager } from "@/components/dashboard/session-manager"

export const metadata: Metadata = {
  title: "Gestión de Sesiones - WikiPeopleStats",
  description: "Gestiona tus sesiones activas y mantén tu cuenta segura",
}

export default function SessionsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Sesiones</h1>
        <p className="text-muted-foreground">
          Controla y gestiona todas las sesiones activas de tu cuenta para mantener tu seguridad.
        </p>
      </div>

      <SessionManager />
    </div>
  )
}
