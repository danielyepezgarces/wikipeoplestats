import { SessionManager } from "@/components/dashboard/session-manager"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SessionsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestión de Sesiones</h1>
        <p className="text-muted-foreground mt-2">
          Controla y gestiona tus sesiones activas en diferentes dispositivos
        </p>
      </div>

      <SessionManager />
    </div>
  )
}
