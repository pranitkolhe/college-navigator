import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export interface User {
  id: string
  password: string
  email: string
  name: string
  role: "user" | "admin"
  createdAt: string
  lastLogin: string | null
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: "user" | "admin"
}

const TOKEN_SECRET = process.env.JWT_SECRET || "campus-navigator-secret-key"

// Create simple token (base64 encoded user data with timestamp)
export function createToken(user: AuthUser): string {
  const tokenData = {
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  return Buffer.from(JSON.stringify(tokenData)).toString("base64")
}

// Verify simple token
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())

    // Check if token is expired
    if (decoded.exp && Date.now() > decoded.exp) {
      return null
    }

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    }
  } catch {
    return null
  }
}

// Get current user from cookies (server-side)
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    return verifyToken(token)
  } catch {
    return null
  }
}

// Get current user from request (middleware/API routes)
export function getCurrentUserFromRequest(request: NextRequest): AuthUser | null {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) return null

    return verifyToken(token)
  } catch {
    return null
  }
}

// Hash password (simple implementation - in production use bcrypt)
export function hashPassword(password: string): string {
  // Simple hash for demo - use bcrypt in production
  return Buffer.from(password + TOKEN_SECRET).toString("base64")
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return Buffer.from(password + TOKEN_SECRET).toString("base64") === hashedPassword
}

// Check if user is admin
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin"
}

// Check if user is authenticated
export function isAuthenticated(user: AuthUser | null): boolean {
  return user !== null
}
