"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Route, AlertCircle, Accessibility, Loader2, RefreshCw } from "lucide-react"
import { CampusMap } from "./campus-map"
import { LocationAutocomplete } from "./location-autocomplete"
import { findPath, formatDistance, formatDuration } from "@/lib/pathfinding"
import { campusDB } from "@/lib/database"
import type { Location } from "@/app/api/locations/route"

export function NavigationForm() {
  const [source, setSource] = useState("")
  const [destination, setDestination] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [accessibleOnly, setAccessibleOnly] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [route, setRoute] = useState<{
    distance: string
    duration: string
    steps: string[]
    path?: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeInput, setActiveInput] = useState<"source" | "destination" | null>(null)

  // Load locations from database on component mount
  useEffect(() => {
    let mounted = true

    const loadLocations = async () => {
      if (!mounted) return

      setIsLoadingLocations(true)
      try {
        const campusLocations = await campusDB.getLocations()
        if (mounted) {
          setLocations(campusLocations)
        }
      } catch (error) {
        console.error("Failed to load locations:", error)
        if (mounted) {
          setError("Failed to load campus locations. Please refresh the page.")
        }
      } finally {
        if (mounted) {
          setIsLoadingLocations(false)
        }
      }
    }

    loadLocations()

    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!source.trim() || !destination.trim()) return

    setIsLoading(true)
    setError(null)
    setRoute(null)

    try {
      const pathResult = await findPath(source, destination, accessibleOnly)

      if (pathResult) {
        setRoute({
          distance: formatDistance(pathResult.distance),
          duration: formatDuration(pathResult.duration),
          steps: pathResult.steps,
          path: pathResult.path,
        })
      } else {
        setError("No route found between these locations. Please check the location names and try again.")
      }
    } catch (error) {
      console.error("Pathfinding error:", error)
      setError("An error occurred while finding the route. Please try again.")
    }

    setIsLoading(false)
  }

  const handleSwapLocations = () => {
    const temp = source
    setSource(destination)
    setDestination(temp)
  }

  const handleLocationSelect = (location: string) => {
    if (activeInput === "source") {
      setSource(location)
      setActiveInput(null)
    } else if (activeInput === "destination") {
      setDestination(location)
      setActiveInput(null)
    } else {
      // If no input is active, set as source by default
      setSource(location)
    }
    // Clear any existing route when locations change
    setRoute(null)
    setError(null)
  }

  const handleClearRoute = () => {
    setRoute(null)
    setError(null)
    setSource("")
    setDestination("")
  }

  const canSubmit = source.trim() && destination.trim() && !isLoading && !isLoadingLocations

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            Plan Your Route
            {isLoadingLocations && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <LocationAutocomplete
                  placeholder="Starting location (e.g., Main Entrance, Library)"
                  value={source}
                  onChange={setSource}
                  onFocus={() => setActiveInput("source")}
                  locations={locations}
                  icon="source"
                />
                {activeInput === "source" && (
                  <div className="absolute right-3 top-3 text-xs text-primary font-medium">Click map to select</div>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSwapLocations}
                  className="text-muted-foreground hover:text-accent"
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Swap
                </Button>
              </div>

              <div className="relative">
                <LocationAutocomplete
                  placeholder="Destination (e.g., Science Building, Cafeteria)"
                  value={destination}
                  onChange={setDestination}
                  onFocus={() => setActiveInput("destination")}
                  locations={locations}
                  icon="destination"
                />
                {activeInput === "destination" && (
                  <div className="absolute right-3 top-3 text-xs text-accent font-medium">Click map to select</div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accessible-only"
                    checked={accessibleOnly}
                    onCheckedChange={(checked) => setAccessibleOnly(checked as boolean)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="accessible-only"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <Accessibility className="w-4 h-4" />
                    Accessible routes only
                  </label>
                </div>

                {(route || source || destination) && (
                  <Button type="button" variant="outline" size="sm" onClick={handleClearRoute} disabled={isLoading}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding Route...
                </>
              ) : (
                "Get Directions"
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!isLoadingLocations && locations.length > 0 && (
            <div className="mt-4 flex items-center justify-center">
              <Badge variant="secondary" className="text-xs">
                {locations.length} campus locations available
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <CampusMap
        source={source}
        destination={destination}
        route={route}
        onLocationSelect={handleLocationSelect}
        locations={locations}
        isLoading={isLoadingLocations}
      />

      {/* Route Results */}
      {route && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5 text-accent" />
              Your Route
              {accessibleOnly && (
                <Badge variant="outline" className="ml-2">
                  <Accessibility className="w-3 h-3 mr-1" />
                  Accessible
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {route.distance}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {route.duration}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {route.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-xs font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-card-foreground flex-1">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
