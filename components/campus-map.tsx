"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Navigation, Zap, Loader2 } from "lucide-react"
import { campusDB } from "@/lib/database"
import type { Location } from "@/app/api/locations/route"
import type { Pathway } from "@/app/api/pathways/route"

interface CampusMapProps {
  source?: string
  destination?: string
  route?: {
    distance: string
    duration: string
    steps: string[]
    path?: string[]
  } | null
  onLocationSelect?: (location: string) => void
  locations?: Location[]
  isLoading?: boolean
}

export function CampusMap({
  source,
  destination,
  route,
  onLocationSelect,
  locations: propLocations,
  isLoading,
}: CampusMapProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [pathways, setPathways] = useState<Pathway[]>([])
  const [highlightedPath, setHighlightedPath] = useState<string[]>([])
  const [mapLoading, setMapLoading] = useState(true)

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      if (propLocations) {
        setLocations(propLocations)
        setMapLoading(false)
        return
      }

      try {
        const [campusLocations, campusPathways] = await Promise.all([campusDB.getLocations(), campusDB.getPathways()])

        setLocations(campusLocations)
        setPathways(campusPathways)
      } catch (error) {
        console.error("Failed to load campus data:", error)
      } finally {
        setMapLoading(false)
      }
    }

    loadData()
  }, [propLocations])

  // Load pathways separately if not loaded
  useEffect(() => {
    const loadPathways = async () => {
      if (pathways.length === 0 && !mapLoading) {
        try {
          const campusPathways = await campusDB.getPathways()
          setPathways(campusPathways)
        } catch (error) {
          console.error("Failed to load pathways:", error)
        }
      }
    }

    loadPathways()
  }, [pathways.length, mapLoading])

  useEffect(() => {
    if (route?.path && route.path.length > 0) {
      setHighlightedPath(route.path)
    } else if (source && destination) {
      const sourceLoc = locations.find((loc) => loc.name.toLowerCase().includes(source.toLowerCase()))
      const destLoc = locations.find((loc) => loc.name.toLowerCase().includes(destination.toLowerCase()))

      if (sourceLoc && destLoc) {
        setHighlightedPath([sourceLoc.id, destLoc.id])
      }
    } else {
      setHighlightedPath([])
    }
  }, [source, destination, route, locations])

  const getLocationColor = (location: Location) => {
    if (highlightedPath.includes(location.id)) {
      if (location.name.toLowerCase().includes(source?.toLowerCase() || "")) {
        return "bg-primary text-primary-foreground shadow-lg scale-110"
      }
      if (location.name.toLowerCase().includes(destination?.toLowerCase() || "")) {
        return "bg-accent text-accent-foreground shadow-lg scale-110"
      }
      return "bg-accent/70 text-accent-foreground shadow-md scale-105"
    }

    switch (location.type) {
      case "building":
        return "bg-card border-2 border-border text-card-foreground hover:bg-muted hover:scale-105"
      case "parking":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105"
      case "entrance":
        return "bg-muted border-2 border-primary/30 text-muted-foreground hover:bg-muted/80 hover:scale-105"
      default:
        return "bg-card text-card-foreground hover:bg-muted hover:scale-105"
    }
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "entrance":
        return <Navigation className="w-3 h-3" />
      case "parking":
        return <span className="text-xs font-bold">P</span>
      default:
        return <MapPin className="w-3 h-3" />
    }
  }

  if (isLoading || mapLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Loading Campus Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-96 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Campus Map
        </CardTitle>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            Starting Point
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            Destination
          </Badge>
          {highlightedPath.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Active Route
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-96 bg-muted/20 rounded-lg border-2 border-border overflow-hidden">
          {/* Campus Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            {/* Pathways */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
              {pathways.map((pathway, index) => {
                const fromLoc = locations.find((loc) => loc.id === pathway.from)
                const toLoc = locations.find((loc) => loc.id === pathway.to)
                if (!fromLoc || !toLoc) return null

                const isHighlighted =
                  highlightedPath.length > 2
                    ? highlightedPath.includes(pathway.from) &&
                      highlightedPath.includes(pathway.to) &&
                      Math.abs(highlightedPath.indexOf(pathway.from) - highlightedPath.indexOf(pathway.to)) === 1
                    : highlightedPath.includes(pathway.from) && highlightedPath.includes(pathway.to)

                return (
                  <line
                    key={pathway.id}
                    x1={`${fromLoc.x}%`}
                    y1={`${fromLoc.y}%`}
                    x2={`${toLoc.x}%`}
                    y2={`${toLoc.y}%`}
                    stroke={isHighlighted ? "#f97316" : "#d1d5db"}
                    strokeWidth={isHighlighted ? "4" : "2"}
                    strokeDasharray={isHighlighted ? "none" : "5,5"}
                    className={isHighlighted ? "animate-pulse" : ""}
                  />
                )
              })}
            </svg>

            {/* Location Markers */}
            {locations.map((location) => (
              <button
                key={location.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 hover:shadow-md z-10 ${getLocationColor(location)}`}
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                }}
                onClick={() => onLocationSelect?.(location.name)}
                title={`${location.name} - ${location.description}`}
              >
                <div className="flex items-center gap-1">
                  {getLocationIcon(location.type)}
                  <span className="hidden sm:inline">{location.name}</span>
                </div>
              </button>
            ))}

            {/* Route Animation */}
            {highlightedPath.length > 0 && route && (
              <div className="absolute top-2 left-2 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-20 border">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-card-foreground font-medium">
                    Active Route: {route.distance} • {route.duration}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Click on any location to select it as your source or destination
        </div>
      </CardContent>
    </Card>
  )
}
