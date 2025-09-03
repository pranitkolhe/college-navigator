import { type NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { getCurrentUserFromRequest, isAdmin } from "@/lib/auth"

export interface Location {
  id: string
  name: string
  x: number
  y: number
  type: "building" | "landmark" | "parking" | "entrance"
  description: string
  amenities: string[]
  accessibility: boolean
}

export async function GET() {
  try {
    const locationsPath = join(process.cwd(), "data", "locations.json")
    const locationsData = readFileSync(locationsPath, "utf-8")
    return NextResponse.json(JSON.parse(locationsData) as Location[])
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const newLocation: Omit<Location, "id"> = await request.json()

    // Read current locations
    const locationsPath = join(process.cwd(), "data", "locations.json")
    const locationsData = readFileSync(locationsPath, "utf-8")
    const locations: Location[] = JSON.parse(locationsData)

    // Create new location with generated ID
    const locationWithId: Location = {
      ...newLocation,
      id: `location-${Date.now()}`,
    }

    // Add to locations array and save
    locations.push(locationWithId)
    writeFileSync(locationsPath, JSON.stringify(locations, null, 2))

    return NextResponse.json(locationWithId, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updatedLocation: Location = await request.json()

    // Read current locations
    const locationsPath = join(process.cwd(), "data", "locations.json")
    const locationsData = readFileSync(locationsPath, "utf-8")
    const locations: Location[] = JSON.parse(locationsData)

    // Find and update location
    const locationIndex = locations.findIndex((loc) => loc.id === updatedLocation.id)
    if (locationIndex === -1) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    locations[locationIndex] = updatedLocation
    writeFileSync(locationsPath, JSON.stringify(locations, null, 2))

    return NextResponse.json(updatedLocation)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get("id")

    if (!locationId) {
      return NextResponse.json({ error: "Location ID required" }, { status: 400 })
    }

    // Read current locations
    const locationsPath = join(process.cwd(), "data", "locations.json")
    const locationsData = readFileSync(locationsPath, "utf-8")
    const locations: Location[] = JSON.parse(locationsData)

    // Filter out the location to delete
    const filteredLocations = locations.filter((loc) => loc.id !== locationId)

    if (filteredLocations.length === locations.length) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    writeFileSync(locationsPath, JSON.stringify(filteredLocations, null, 2))

    return NextResponse.json({ message: "Location deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
  }
}
