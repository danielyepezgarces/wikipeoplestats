import type { Metadata } from "next"
import { SessionManager } from "@/components/dashboard/session-manager"

export const metadata: Metadata = {
  title: "Session Management",
  description: "Manage your active login sessions",
}

export default function SessionsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Session Management</h1>
          <p className="text-muted-foreground">
            View and manage your active login sessions across different devices and browsers.
          </p>
        </div>

        <SessionManager />
      </div>
    </div>
  )
}
