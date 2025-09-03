import { type NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { createToken, verifyPassword, type User } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Read users from file
    const usersPath = join(process.cwd(), "data", "users.json")
    const usersData = readFileSync(usersPath, "utf-8")
    const users: User[] = JSON.parse(usersData)

    // Find user by email
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login
    user.lastLogin = new Date().toISOString()
    writeFileSync(usersPath, JSON.stringify(users, null, 2))

    // Create token
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
    const token = createToken(authUser)

    // Set cookie and return user data
    const response = NextResponse.json({ user: authUser })
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


