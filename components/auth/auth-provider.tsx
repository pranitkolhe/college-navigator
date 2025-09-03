"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { AuthUser } from "@/lib/auth"

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store", // Explicitly handle caching
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    setIsLoading(true)
    await checkAuth()
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      })
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      if (mounted) {
        await checkAuth()
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
