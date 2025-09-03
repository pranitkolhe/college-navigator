"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Route } from "lucide-react"
import type { Location } from "@/app/api/locations/route"
import type { Pathway } from "@/app/api/pathways/route"

interface PathwayFormProps {
  pathway?: Pathway | null
  locations: Location[]
  onSave: (pathway: Pathway) => void
  onCancel: () => void
}

export function PathwayForm({ pathway, locations, onSave, onCancel }: PathwayFormProps) {
  const [formData, setFormData] = useState({
    from: pathway?.from || "",
    to: pathway?.to || "",
    distance: pathway?.distance || 100,
    surface: pathway?.surface || "paved",
    accessibility: pathway?.accessibility || false,
    lighting: pathway?.lighting || false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const method = pathway ? "PUT" : "POST"
      const body = pathway ? { ...formData, id: pathway.id } : formData

      const response = await fetch("/api/pathways", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const savedPathway = await response.json()
        onSave(savedPathway)
      }
    } catch (error) {
      console.error("Failed to save pathway:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Route className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{pathway ? "Edit Pathway" : "Add New Pathway"}</h1>
              <p className="text-sm text-muted-foreground">
                {pathway ? "Update pathway details" : "Create a new connection between locations"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Pathway Details</CardTitle>
              <CardDescription>Define the connection between two campus locations</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from">From Location</Label>
                    <Select value={formData.from} onValueChange={(value) => setFormData({ ...formData, from: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select starting location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to">To Location</Label>
                    <Select value={formData.to} onValueChange={(value) => setFormData({ ...formData, to: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (meters)</Label>
                    <Input
                      id="distance"
                      type="number"
                      min="1"
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surface">Surface Type</Label>
                    <Select
                      value={formData.surface}
                      onValueChange={(value) => setFormData({ ...formData, surface: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paved">Paved</SelectItem>
                        <SelectItem value="gravel">Gravel</SelectItem>
                        <SelectItem value="grass">Grass</SelectItem>
                        <SelectItem value="dirt">Dirt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accessibility"
                      checked={formData.accessibility}
                      onCheckedChange={(checked) => setFormData({ ...formData, accessibility: checked as boolean })}
                    />
                    <Label htmlFor="accessibility">Wheelchair accessible</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lighting"
                      checked={formData.lighting}
                      onCheckedChange={(checked) => setFormData({ ...formData, lighting: checked as boolean })}
                    />
                    <Label htmlFor="lighting">Well-lit pathway</Label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading || formData.from === formData.to}>
                    {isLoading ? "Saving..." : pathway ? "Update Pathway" : "Create Pathway"}
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
