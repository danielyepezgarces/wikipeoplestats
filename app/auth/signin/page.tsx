import { LoginButton } from "@/components/auth/login-button"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#0D161C]">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Use your Wikipedia account to sign in
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <LoginButton />
        </div>
      </div>
    </div>
  )
}