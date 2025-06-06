import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#0D161C]">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            There was an error signing in with Wikipedia
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}