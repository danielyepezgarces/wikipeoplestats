import type { Metadata } from "next"
import { SessionManager } from "@/components/dashboard/session-manager"

export const metadata: Metadata = {
  title: "Session Management - WikiPeopleStats",
  description: "Manage your active sessions and security settings",
}

export default function SessionsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Session Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your active sessions across different devices and browsers.
          </p>
        </div>

        <SessionManager />
      </div>
    </div>
  )
}
