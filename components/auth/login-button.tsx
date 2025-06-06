"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut } from "lucide-react"

export function LoginButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button
        variant="outline"
        onClick={() => signOut()}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={() => signIn("wikipedia")}
      className="flex items-center gap-2"
    >
      <LogIn className="h-4 w-4" />
      Sign In with Wikipedia
    </Button>
  )
}