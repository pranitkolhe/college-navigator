import { type NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { createToken, hashPassword, type User } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Read users from file
    const usersPath = join(process.cwd(), "data", "users.json")
    const usersData = readFileSync(usersPath, "utf-8")
    const users: User[] = JSON.parse(usersData)

    // Check if user already exists
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      password: hashPassword(password),
      name,
      role: "user",
      createdAt: new Date().toISOString(),
      lastLogin: null,
    }

    users.push(newUser)
    writeFileSync(usersPath, JSON.stringify(users, null, 2))

    // Create token
    const authUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
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
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
