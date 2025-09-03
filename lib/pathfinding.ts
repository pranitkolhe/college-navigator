import { campusDB } from "./database"
import type { Location } from "@/app/api/locations/route"
import type { Pathway } from "@/app/api/pathways/route"

interface PathResult {
  path: string[]
  distance: number
  duration: number
  steps: string[]
}

// Calculate Euclidean distance between two locations (fallback)
function calculateDistance(loc1: Location, loc2: Location): number {
  const dx = loc1.x - loc2.x
  const dy = loc1.y - loc2.y
  // Convert percentage coordinates to approximate meters (assuming 100% = 1000m)
  return Math.sqrt(dx * dx + dy * dy) * 10
}

// Build adjacency graph from locations and pathways
function buildGraph(locations: Location[], pathways: Pathway[]): Map<string, { id: string; distance: number }[]> {
  const graph = new Map<string, { id: string; distance: number }[]>()

  // Initialize graph with all locations
  locations.forEach((location) => {
    graph.set(location.id, [])
  })

  // Add edges based on pathways
  pathways.forEach((pathway) => {
    const fromLoc = locations.find((loc) => loc.id === pathway.from)
    const toLoc = locations.find((loc) => loc.id === pathway.to)

    if (fromLoc && toLoc) {
      // Use actual pathway distance if available, otherwise calculate
      const distance = pathway.distance || calculateDistance(fromLoc, toLoc)

      // Add bidirectional edges
      graph.get(pathway.from)?.push({ id: pathway.to, distance })
      graph.get(pathway.to)?.push({ id: pathway.from, distance })
    }
  })

  return graph
}

// Dijkstra's algorithm implementation
function dijkstra(
  graph: Map<string, { id: string; distance: number }[]>,
  start: string,
  end: string
): string[] {
  const distances = new Map<string, number>()
  const previous = new Map<string, string | null>()
  const visited = new Set<string>()

  for (const node of graph.keys()) {
    distances.set(node, Infinity)
    previous.set(node, null)
  }
  distances.set(start, 0)

  while (visited.size < graph.size) {
    let current: string | null = null
    let minDist = Infinity
    for (const [node, dist] of distances.entries()) {
      if (!visited.has(node) && dist < minDist) {
        current = node
        minDist = dist
      }
    }

    if (current === null) break
    if (current === end) break
    visited.add(current)

    for (const neighbor of graph.get(current) || []) {
      if (visited.has(neighbor.id)) continue
      const newDist = (distances.get(current) ?? Infinity) + neighbor.distance
      if (newDist < (distances.get(neighbor.id) ?? Infinity)) {
        distances.set(neighbor.id, newDist)
        previous.set(neighbor.id, current)
      }
    }
  }

  // Reconstruct path
  const path: string[] = []
  let node: string | null = end
  while (node) {
    path.unshift(node)
    node = previous.get(node) || null
  }

  return path[0] === start ? path : []
}


// Generate walking directions from path
function generateDirections(path: string[], locations: Location[]): string[] {
  if (path.length < 2) return []

  const directions: string[] = []
  const locationMap = new Map(locations.map((loc) => [loc.id, loc]))

  for (let i = 0; i < path.length; i++) {
    const currentLoc = locationMap.get(path[i])
    if (!currentLoc) continue

    if (i === 0) {
      directions.push(`Start at ${currentLoc.name}`)
    } else if (i === path.length - 1) {
      directions.push(`Arrive at ${currentLoc.name}`)
    } else {
      const prevLoc = locationMap.get(path[i - 1])
      const nextLoc = locationMap.get(path[i + 1])

      if (prevLoc && nextLoc) {
        // Calculate direction based on coordinates
        const fromPrev = { x: currentLoc.x - prevLoc.x, y: currentLoc.y - prevLoc.y }
        const toNext = { x: nextLoc.x - currentLoc.x, y: nextLoc.y - currentLoc.y }

        // Simple direction calculation
        let direction = "Continue"
        if (Math.abs(toNext.x) > Math.abs(toNext.y)) {
          direction = toNext.x > 0 ? "Head east" : "Head west"
        } else {
          direction = toNext.y > 0 ? "Head south" : "Head north"
        }

        directions.push(`${direction} toward ${currentLoc.name}`)
      }
    }
  }

  return directions
}

// Main pathfinding function with database integration
export async function findPath(
  sourceQuery: string,
  destinationQuery: string,
  accessibleOnly = false,
): Promise<PathResult | null> {
  try {
    // Fetch data from database
    const locations = await campusDB.getLocations()
    const pathways = accessibleOnly ? await campusDB.getAccessiblePaths() : await campusDB.getPathways()

    const sourceLoc = locations.find(
      (loc) =>
        loc.name.toLowerCase().includes(sourceQuery.toLowerCase()) ||
        sourceQuery.toLowerCase().includes(loc.name.toLowerCase()) ||
        loc.name.toLowerCase().replace(/\s+/g, "").includes(sourceQuery.toLowerCase().replace(/\s+/g, "")) ||
        loc.id.toLowerCase().includes(sourceQuery.toLowerCase().replace(/\s+/g, "-")),
    )

    const destLoc = locations.find(
      (loc) =>
        loc.name.toLowerCase().includes(destinationQuery.toLowerCase()) ||
        destinationQuery.toLowerCase().includes(loc.name.toLowerCase()) ||
        loc.name.toLowerCase().replace(/\s+/g, "").includes(destinationQuery.toLowerCase().replace(/\s+/g, "")) ||
        loc.id.toLowerCase().includes(destinationQuery.toLowerCase().replace(/\s+/g, "-")),
    )

    if (!sourceLoc) {
      console.error(
        `[v0] Source location not found: "${sourceQuery}". Available locations:`,
        locations.map((l) => l.name),
      )
      return null
    }

    if (!destLoc) {
      console.error(
        `[v0] Destination location not found: "${destinationQuery}". Available locations:`,
        locations.map((l) => l.name),
      )
      return null
    }

    console.log(`[v0] Found source: ${sourceLoc.name} (${sourceLoc.id})`)
    console.log(`[v0] Found destination: ${destLoc.name} (${destLoc.id})`)

    // Build graph and find path
    const graph = buildGraph(locations, pathways)

    console.log(`[v0] Graph connections for ${sourceLoc.id}:`, graph.get(sourceLoc.id))
    console.log(`[v0] Graph connections for ${destLoc.id}:`, graph.get(destLoc.id))

    const path = dijkstra(graph, sourceLoc.id, destLoc.id)

    if (path.length === 0) {
      console.error(`[v0] No path found between ${sourceLoc.name} and ${destLoc.name}`)
      console.log(`[v0] Total locations in graph:`, graph.size)
      console.log(`[v0] Total pathways:`, pathways.length)
      return null
    }

    console.log(`[v0] Found path:`, path.map((id) => locations.find((l) => l.id === id)?.name).join(" → "))

    // Calculate total distance using actual pathway distances
    let totalDistance = 0
    for (let i = 0; i < path.length - 1; i++) {
      const currentId = path[i]
      const nextId = path[i + 1]

      // Find the pathway between these locations
      const pathway = pathways.find(
        (p) => (p.from === currentId && p.to === nextId) || (p.from === nextId && p.to === currentId),
      )

      if (pathway) {
        totalDistance += pathway.distance
      } else {
        // Fallback to calculated distance
        const currentLoc = locations.find((loc) => loc.id === currentId)
        const nextLoc = locations.find((loc) => loc.id === nextId)
        if (currentLoc && nextLoc) {
          totalDistance += calculateDistance(currentLoc, nextLoc)
        }
      }
    }

    // Estimate walking time (average walking speed: 5 km/h = 1.39 m/s)
    const walkingSpeedMs = 1.39
    const durationSeconds = totalDistance / walkingSpeedMs
    const durationMinutes = Math.ceil(durationSeconds / 60)

    // Generate directions
    const steps = generateDirections(path, locations)

    return {
      path,
      distance: totalDistance,
      duration: durationMinutes,
      steps,
    }
  } catch (error) {
    console.error("[v0] Error in pathfinding:", error)
    return null
  }
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  } else {
    return `${(meters / 1000).toFixed(1)}km`
  }
}

// Format duration for display
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }
}
