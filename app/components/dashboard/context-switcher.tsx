"use client"

import { useState } from "react"
import { Check, ChevronDown, Building, Globe, Shield, Users, Gavel, Handshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

interface ActiveContext {
  role: string
  chapterId?: number
  chapterName?: string
}

export function ContextSwitcher() {
  const { activeContext, switchContext, getAvailableContexts } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  
  const availableContexts = getAvailableContexts()
  
  // No mostrar si no hay contexto activo o solo hay uno
  if (!activeContext || availableContexts.length <= 1) {
    return null
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Globe className="h-4 w-4 text-red-500" />
      case 'chapter_admin':
      case 'community_admin':
        return <Building className="h-4 w-4 text-orange-500" />
      case 'chapter_moderator':
      case 'community_moderator':
        return <Gavel className="h-4 w-4 text-blue-500" />
      case 'chapter_staff':
        return <Users className="h-4 w-4 text-green-500" />
      case 'chapter_partner':
      case 'chapter_affiliate':
      case 'community_partner':
        return <Handshake className="h-4 w-4 text-purple-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'chapter_admin':
        return 'Chapter Admin'
      case 'community_admin':
        return 'Community Admin'
      case 'chapter_moderator':
        return 'Moderator'
      case 'community_moderator':
        return 'Community Moderator'
      case 'chapter_staff':
        return 'Staff'
      case 'chapter_partner':
        return 'Partner'
      case 'chapter_affiliate':
        return 'Affiliate'
      case 'community_partner':
        return 'Community Partner'
      default:
        return role
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive'
      case 'chapter_admin':
      case 'community_admin':
        return 'default'
      case 'chapter_moderator':
      case 'community_moderator':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const handleContextSwitch = (context: ActiveContext) => {
    console.log('Switching to context:', context)
    switchContext(context)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            {getRoleIcon(activeContext.role)}
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {getRoleDisplayName(activeContext.role)}
              </span>
              {activeContext.chapterName && (
                <span className="text-xs text-muted-foreground">
                  {activeContext.chapterName}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[280px]" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Switch Dashboard Context
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableContexts.map((context, index) => (
          <DropdownMenuItem
            key={`${context.role}-${context.chapterId || 'global'}`}
            onClick={() => handleContextSwitch(context)}
            className="flex items-center justify-between p-3 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {getRoleIcon(context.role)}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {getRoleDisplayName(context.role)}
                  </span>
                  <Badge 
                    variant={getRoleBadgeVariant(context.role)}
                    className="text-xs"
                  >
                    {context.role === 'super_admin' ? 'Global' : 'Chapter'}
                  </Badge>
                </div>
                {context.chapterName && (
                  <span className="text-sm text-muted-foreground">
                    {context.chapterName}
                  </span>
                )}
              </div>
            </div>
            
            {activeContext.role === context.role && 
             activeContext.chapterId === context.chapterId && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <div className="p-2">
          <div className="text-xs text-muted-foreground text-center">
            Switch between your available roles and chapters
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}