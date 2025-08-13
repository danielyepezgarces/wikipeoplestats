"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Shield, Users, Flag, User } from "lucide-react"

interface Dashboard {
  key: string
  label: string
  role: string
}

interface DashboardSwitcherProps {
  availableDashboards: Dashboard[]
  selectedDashboard: string
  onDashboardChange: (dashboard: string) => void
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "super_admin":
      return <Shield className="h-4 w-4" />
    case "chapter_admin":
      return <Users className="h-4 w-4" />
    case "chapter_moderator":
      return <Flag className="h-4 w-4" />
    default:
      return <User className="h-4 w-4" />
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "super_admin":
      return "destructive"
    case "chapter_admin":
      return "secondary"
    case "chapter_moderator":
      return "outline"
    default:
      return "default"
  }
}

export function DashboardSwitcher({
  availableDashboards,
  selectedDashboard,
  onDashboardChange,
}: DashboardSwitcherProps) {
  const currentDashboard = availableDashboards.find((d) => d.key === selectedDashboard)

  return (
    <div className="border-b bg-white dark:bg-gray-900 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                {currentDashboard && getRoleIcon(currentDashboard.role)}
                {currentDashboard?.label || "Select Dashboard"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {availableDashboards.map((dashboard) => (
                <DropdownMenuItem
                  key={dashboard.key}
                  onClick={() => onDashboardChange(dashboard.key)}
                  className="flex items-center gap-2"
                >
                  {getRoleIcon(dashboard.role)}
                  <span className="flex-1">{dashboard.label}</span>
                  {selectedDashboard === dashboard.key && (
                    <Badge variant={getRoleColor(dashboard.role) as any} className="text-xs">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
