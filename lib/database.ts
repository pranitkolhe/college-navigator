import type { Location } from "@/app/api/locations/route"
import type { Pathway } from "@/app/api/pathways/route"

// Database service for campus navigation data
export class CampusDatabase {
  private static instance: CampusDatabase
  private locationsCache: Location[] | null = null
  private pathwaysCache: Pathway[] | null = null

  private constructor() {}

  static getInstance(): CampusDatabase {
    if (!CampusDatabase.instance) {
      CampusDatabase.instance = new CampusDatabase()
    }
    return CampusDatabase.instance
  }

  async getLocations(): Promise<Location[]> {
    if (this.locationsCache) {
      return this.locationsCache
    }

    try {
      const response = await fetch("/api/locations")
      if (!response.ok) {
        throw new Error("Failed to fetch locations")
      }

      const locations = await response.json()
      this.locationsCache = locations
      return locations
    } catch (error) {
      console.error("Error fetching locations:", error)
      return []
    }
  }

  async getPathways(): Promise<Pathway[]> {
    if (this.pathwaysCache) {
      return this.pathwaysCache
    }

    try {
      const response = await fetch("/api/pathways")
      if (!response.ok) {
        throw new Error("Failed to fetch pathways")
      }

      const pathways = await response.json()
      this.pathwaysCache = pathways
      return pathways
    } catch (error) {
      console.error("Error fetching pathways:", error)
      return []
    }
  }

  async searchLocations(query: string): Promise<Location[]> {
    const locations = await this.getLocations()
    const searchTerm = query.toLowerCase()

    return locations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchTerm) ||
        location.description.toLowerCase().includes(searchTerm) ||
        location.amenities.some((amenity) => amenity.toLowerCase().includes(searchTerm)),
    )
  }

  async getLocationById(id: string): Promise<Location | null> {
    const locations = await this.getLocations()
    return locations.find((location) => location.id === id) || null
  }

  async getAccessiblePaths(): Promise<Pathway[]> {
    const pathways = await this.getPathways()
    return pathways.filter((pathway) => pathway.accessibility)
  }

  // Clear cache when data is updated
  clearCache(): void {
    this.locationsCache = null
    this.pathwaysCache = null
  }
}

// Export singleton instance
export const campusDB = CampusDatabase.getInstance()
