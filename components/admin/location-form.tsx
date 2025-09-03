"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { MapPin, X, Plus } from "lucide-react"
import type { Location } from "@/app/api/locations/route"

interface LocationFormProps {
  location?: Location | null
  onSave: (location: Location) => void
  onCancel: () => void
}

export function LocationForm({ location, onSave, onCancel }: LocationFormProps) {
  const [formData, setFormData] = useState({
    name: location?.name || "",
    x: location?.x || 50,
    y: location?.y || 50,
    type: location?.type || ("building" as const),
    description: location?.description || "",
    amenities: location?.amenities || [],
    accessibility: location?.accessibility || false,
  })
  const [newAmenity, setNewAmenity] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const method = location ? "PUT" : "POST"
      const body = location ? { ...formData, id: location.id } : formData

      const response = await fetch("/api/locations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const savedLocation = await response.json()
        onSave(savedLocation)
      }
    } catch (error) {
      console.error("Failed to save location:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      })
      setNewAmenity("")
    }
  }

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((a) => a !== amenity),
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{location ? "Edit Location" : "Add New Location"}</h1>
              <p className="text-sm text-muted-foreground">
                {location ? "Update location details" : "Create a new campus location"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>Fill in the information for this campus location</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Location Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Location Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="building">Building</SelectItem>
                        <SelectItem value="landmark">Landmark</SelectItem>
                        <SelectItem value="parking">Parking</SelectItem>
                        <SelectItem value="entrance">Entrance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="x">X Coordinate (%)</Label>
                    <Input
                      id="x"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.x}
                      onChange={(e) => setFormData({ ...formData, x: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="y">Y Coordinate (%)</Label>
                    <Input
                      id="y"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.y}
                      onChange={(e) => setFormData({ ...formData, y: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Add amenity..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                    />
                    <Button type="button" onClick={addAmenity} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accessibility"
                    checked={formData.accessibility}
                    onCheckedChange={(checked) => setFormData({ ...formData, accessibility: checked as boolean })}
                  />
                  <Label htmlFor="accessibility">Wheelchair accessible</Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : location ? "Update Location" : "Create Location"}
                  </Button>
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
