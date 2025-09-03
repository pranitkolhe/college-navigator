import { type NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { getCurrentUserFromRequest, isAdmin } from "@/lib/auth"

export interface Pathway {
  id: string
  from: string
  to: string
  distance: number
  surface: string
  accessibility: boolean
  lighting: boolean
}

export async function GET() {
  try {
    const pathwaysPath = join(process.cwd(), "data", "pathways.json")
    const pathwaysData = readFileSync(pathwaysPath, "utf-8")
    return NextResponse.json(JSON.parse(pathwaysData) as Pathway[])
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pathways" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const newPathway: Omit<Pathway, "id"> = await request.json()

    // Read current pathways
    const pathwaysPath = join(process.cwd(), "data", "pathways.json")
    const pathwaysData = readFileSync(pathwaysPath, "utf-8")
    const pathways: Pathway[] = JSON.parse(pathwaysData)

    // Create new pathway with generated ID
    const pathwayWithId: Pathway = {
      ...newPathway,
      id: `pathway-${Date.now()}`,
    }

    // Add to pathways array and save
    pathways.push(pathwayWithId)
    writeFileSync(pathwaysPath, JSON.stringify(pathways, null, 2))

    return NextResponse.json(pathwayWithId, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create pathway" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updatedPathway: Pathway = await request.json()

    // Read current pathways
    const pathwaysPath = join(process.cwd(), "data", "pathways.json")
    const pathwaysData = readFileSync(pathwaysPath, "utf-8")
    const pathways: Pathway[] = JSON.parse(pathwaysData)

    // Find and update pathway
    const pathwayIndex = pathways.findIndex((path) => path.id === updatedPathway.id)
    if (pathwayIndex === -1) {
      return NextResponse.json({ error: "Pathway not found" }, { status: 404 })
    }

    pathways[pathwayIndex] = updatedPathway
    writeFileSync(pathwaysPath, JSON.stringify(pathways, null, 2))

    return NextResponse.json(updatedPathway)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update pathway" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pathwayId = searchParams.get("id")

    if (!pathwayId) {
      return NextResponse.json({ error: "Pathway ID required" }, { status: 400 })
    }

    // Read current pathways
    const pathwaysPath = join(process.cwd(), "data", "pathways.json")
    const pathwaysData = readFileSync(pathwaysPath, "utf-8")
    const pathways: Pathway[] = JSON.parse(pathwaysData)

    // Filter out the pathway to delete
    const filteredPathways = pathways.filter((path) => path.id !== pathwayId)

    if (filteredPathways.length === pathways.length) {
      return NextResponse.json({ error: "Pathway not found" }, { status: 404 })
    }

    writeFileSync(pathwaysPath, JSON.stringify(filteredPathways, null, 2))

    return NextResponse.json({ message: "Pathway deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete pathway" }, { status: 500 })
  }
}
