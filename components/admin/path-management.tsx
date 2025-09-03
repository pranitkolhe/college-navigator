"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Route, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { AuthUser } from "@/lib/auth"
import type { Location } from "@/app/api/locations/route"
import type { Pathway } from "@/app/api/pathways/route"
import { LocationForm } from "./location-form"
import { PathwayForm } from "./pathway-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PathManagementProps {
  user: AuthUser
}

export function PathManagement({ user }: PathManagementProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [pathways, setPathways] = useState<Pathway[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [showPathwayForm, setShowPathwayForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [editingPathway, setEditingPathway] = useState<Pathway | null>(null)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [locationsRes, pathwaysRes] = await Promise.all([fetch("/api/locations"), fetch("/api/pathways")])

      if (locationsRes.ok && pathwaysRes.ok) {
        const locationsData = await locationsRes.json()
        const pathwaysData = await pathwaysRes.json()
        setLocations(locationsData)
        setPathways(pathwaysData)
      }
    } catch (error) {
      setAlert({ type: "error", message: "Failed to fetch data" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return

    try {
      const response = await fetch(`/api/locations?id=${locationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setLocations(locations.filter((loc) => loc.id !== locationId))
        setAlert({ type: "success", message: "Location deleted successfully" })
      } else {
        setAlert({ type: "error", message: "Failed to delete location" })
      }
    } catch (error) {
      setAlert({ type: "error", message: "Failed to delete location" })
    }
  }

  const handleDeletePathway = async (pathwayId: string) => {
    if (!confirm("Are you sure you want to delete this pathway?")) return

    try {
      const response = await fetch(`/api/pathways?id=${pathwayId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPathways(pathways.filter((path) => path.id !== pathwayId))
        setAlert({ type: "success", message: "Pathway deleted successfully" })
      } else {
        setAlert({ type: "error", message: "Failed to delete pathway" })
      }
    } catch (error) {
      setAlert({ type: "error", message: "Failed to delete pathway" })
    }
  }

  const handleLocationSaved = (location: Location) => {
    if (editingLocation) {
      setLocations(locations.map((loc) => (loc.id === location.id ? location : loc)))
      setAlert({ type: "success", message: "Location updated successfully" })
    } else {
      setLocations([...locations, location])
      setAlert({ type: "success", message: "Location created successfully" })
    }
    setShowLocationForm(false)
    setEditingLocation(null)
  }

  const handlePathwaySaved = (pathway: Pathway) => {
    if (editingPathway) {
      setPathways(pathways.map((path) => (path.id === pathway.id ? pathway : path)))
      setAlert({ type: "success", message: "Pathway updated successfully" })
    } else {
      setPathways([...pathways, pathway])
      setAlert({ type: "success", message: "Pathway created successfully" })
    }
    setShowPathwayForm(false)
    setEditingPathway(null)
  }

  const getLocationName = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId)
    return location ? location.name : locationId
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (showLocationForm) {
    return (
      <LocationForm
        location={editingLocation}
        onSave={handleLocationSaved}
        onCancel={() => {
          setShowLocationForm(false)
          setEditingLocation(null)
        }}
      />
    )
  }

  if (showPathwayForm) {
    return (
      <PathwayForm
        pathway={editingPathway}
        locations={locations}
        onSave={handlePathwaySaved}
        onCancel={() => {
          setShowPathwayForm(false)
          setEditingPathway(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Path Management</h1>
                <p className="text-sm text-muted-foreground">Manage campus locations and pathways</p>
              </div>
            </div>
            <Badge variant="secondary">Administrator</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {alert && (
          <Alert className={`mb-6 ${alert.type === "error" ? "border-red-500" : "border-green-500"}`}>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="locations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="pathways">Pathways</TabsTrigger>
          </TabsList>

          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Campus Locations ({locations.length})
                    </CardTitle>
                    <CardDescription>Manage all campus locations and their details</CardDescription>
                  </div>
                  <Button onClick={() => setShowLocationForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{location.name}</h3>
                          <Badge variant="outline">{location.type}</Badge>
                          {location.accessibility && <Badge variant="secondary">Accessible</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{location.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {location.amenities.map((amenity) => (
                            <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingLocation(location)
                            setShowLocationForm(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteLocation(location.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pathways">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="w-5 h-5" />
                      Campus Pathways ({pathways.length})
                    </CardTitle>
                    <CardDescription>Manage connections between campus locations</CardDescription>
                  </div>
                  <Button onClick={() => setShowPathwayForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pathway
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pathways.map((pathway) => (
                    <div
                      key={pathway.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">
                            {getLocationName(pathway.from)} → {getLocationName(pathway.to)}
                          </h3>
                          <Badge variant="outline">{pathway.distance}m</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{pathway.surface}</Badge>
                          {pathway.accessibility && <Badge variant="secondary">Accessible</Badge>}
                          {pathway.lighting && <Badge variant="secondary">Well-lit</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingPathway(pathway)
                            setShowPathwayForm(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeletePathway(pathway.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
