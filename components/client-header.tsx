"use client"

import { useState } from "react"
import { Navigation, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import type { AuthUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface ClientHeaderProps {
  user: AuthUser | null
}

export function ClientHeader({ user: initialUser }: ClientHeaderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const router = useRouter()

  const handleAuthSuccess = () => {
    setShowAuth(false)
    router.refresh()
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleAdminDashboard = () => {
    router.push("/admin")
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {authMode === "login" ? (
          <LoginForm onSuccess={handleAuthSuccess} onSwitchToRegister={() => setAuthMode("register")} />
        ) : (
          <RegisterForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setAuthMode("login")} />
        )}
      </div>
    )
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Navigation className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Campus Navigator</h1>
              <p className="text-sm text-muted-foreground">Find your way around campus</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">
                      {user.role === "admin" ? "Administrator" : "Student"}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={handleAdminDashboard}>
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setShowAuth(true)} size="sm">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
