"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Shield, Users, Flag, User, Building2 } from "lucide-react"

interface Dashboard {
  key: string
  label: string
  role: string
  chapter: string
  chapterId: number | null
}

interface DashboardSwitcherProps {
  user: any
  availableDashboards: Dashboard[]
  selectedDashboard: string
  onDashboardChange: (dashboard: string) => void
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "super_admin":
      return <Shield className="h-4 w-4 text-red-500" />
    case "chapter_admin":
      return <Users className="h-4 w-4 text-blue-500" />
    case "chapter_moderator":
      return <Flag className="h-4 w-4 text-green-500" />
    default:
      return <User className="h-4 w-4 text-gray-500" />
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "super_admin":
      return "bg-red-50 text-red-700 border-red-200"
    case "chapter_admin":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "chapter_moderator":
      return "bg-green-50 text-green-700 border-green-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const getInitials = (username: string): string => {
  if (!username || typeof username !== "string") return "U"
  return username.slice(0, 2).toUpperCase()
}

export function DashboardSwitcher({
  user,
  availableDashboards,
  selectedDashboard,
  onDashboardChange,
}: DashboardSwitcherProps) {
  const currentDashboard = availableDashboards.find((d) => d.key === selectedDashboard)

  return (
    <div className="border-b bg-white dark:bg-gray-900 px-4 py-3 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm font-medium">{getInitials(user.username)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentDashboard?.chapter || "Personal"}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {currentDashboard && getRoleIcon(currentDashboard.role)}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{currentDashboard?.label || "Select Dashboard"}</span>
                  <span className="text-xs text-gray-500">{currentDashboard?.chapter}</span>
                </div>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Switch Dashboard
              </div>
              <DropdownMenuSeparator />
              {availableDashboards.map((dashboard, index) => (
                <DropdownMenuItem
                  key={dashboard.key}
                  onClick={() => onDashboardChange(dashboard.key)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getRoleIcon(dashboard.role)}
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{dashboard.label}</span>
                        {selectedDashboard === dashboard.key && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Building2 className="h-3 w-3" />
                        {dashboard.chapter}
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(dashboard.role)}`}>
                    {dashboard.role.replace("_", " ").replace("chapter ", "")}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
