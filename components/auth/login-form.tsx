"use client"

import { useState } from "react"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface LoginFormProps {
  onLogin: (user: { email: string; name: string; role: string }) => void
  onClose: () => void
}

export function LoginForm({ onLogin, onClose }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Demo users
  const demoUsers = [
    { email: "admin@wikipeoplestats.org", password: "admin123", name: "Admin User", role: "admin" },
    { email: "editor@wikipeoplestats.org", password: "editor123", name: "Editor User", role: "editor" },
    { email: "viewer@wikipeoplestats.org", password: "viewer123", name: "Viewer User", role: "viewer" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = demoUsers.find(
      u => u.email === formData.email && u.password === formData.password
    )

    if (user) {
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })
      onLogin(user)
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setFormData({ email: user.email, password: user.password })
    onLogin(user)
    toast({
      title: "Demo login",
      description: `Logged in as ${user.name} (${user.role})`,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
            </div>
          </div>

          <div className="space-y-2">
            {demoUsers.map((user) => (
              <Button
                key={user.email}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleDemoLogin(user)}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    user.role === 'admin' ? 'bg-red-500' : 
                    user.role === 'editor' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <span>{user.name}</span>
                  <span className="text-xs text-muted-foreground">({user.role})</span>
                </div>
              </Button>
            ))}
          </div>

          <div className="text-xs text-center text-muted-foreground">
            This is a demo. Use any of the accounts above or the credentials shown.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}