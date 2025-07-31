"use client"

import { useState } from "react"
import { User, Settings, LogOut, Shield, Users, Gavel, Handshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserMenuProps {
  user: {
    name: string
    email: string
    role: string
    chapter?: string
  }
  onLogout: () => void
  onDashboard: () => void
}

export function UserMenu({ user, onLogout, onDashboard }: UserMenuProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'community_admin':
        return <Users className="h-4 w-4 text-orange-500" />
      case 'community_moderator':
        return <Gavel className="h-4 w-4 text-blue-500" />
      case 'community_partner':
        return <Handshake className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500'
      case 'community_admin':
        return 'bg-orange-500'
      case 'community_moderator':
        return 'bg-blue-500'
      case 'community_partner':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrador'
      case 'community_admin':
        return 'Admin de Comunidad'
      case 'community_moderator':
        return 'Moderador de Comunidad'
      case 'community_partner':
        return 'Socio/Afiliado'
      default:
        return role
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={`${getRoleColor(user.role)} text-white`}>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              {getRoleIcon(user.role)}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {getRoleDisplayName(user.role)}
            </p>
            {user.chapter && (
              <p className="text-xs leading-none text-blue-600 dark:text-blue-400">
                {user.chapter}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDashboard}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Panel de Control</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
