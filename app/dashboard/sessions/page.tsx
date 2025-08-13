import type { Metadata } from "next"
import { SessionManager } from "@/components/dashboard/session-manager"

export const metadata: Metadata = {
  title: "Session Management - WikiPeopleStats",
  description: "Manage your active login sessions and account security",
}

export default function SessionsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Session Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage your active login sessions across different devices and locations.
        </p>
      </div>
      <SessionManager />
    </div>
  )
}
