"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Navigation, Building, Car } from "lucide-react"
import type { Location } from "@/app/api/locations/route"

interface LocationAutocompleteProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onFocus: () => void
  locations: Location[]
  icon: "source" | "destination"
  className?: string
}

export function LocationAutocomplete({
  placeholder,
  value,
  onChange,
  onFocus,
  locations,
  icon,
  className,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.trim().length > 0) {
      const filtered = locations
        .filter(
          (location) =>
            location.name.toLowerCase().includes(value.toLowerCase()) ||
            location.description.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 5)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
    setSelectedIndex(-1)
  }, [value, locations])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const selectSuggestion = (location: Location) => {
    onChange(location.name)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "entrance":
        return <Navigation className="w-3 h-3" />
      case "parking":
        return <Car className="w-3 h-3" />
      case "building":
        return <Building className="w-3 h-3" />
      default:
        return <MapPin className="w-3 h-3" />
    }
  }

  const IconComponent = icon === "source" ? MapPin : Navigation
  const iconColor = icon === "source" ? "text-primary" : "text-accent"

  return (
    <div className="relative">
      <IconComponent className={`absolute left-3 top-3 w-4 h-4 ${iconColor}`} />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        className={`pl-10 ${className}`}
        autoComplete="off"
      />

      {showSuggestions && (
        <Card
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto border shadow-lg"
        >
          {suggestions.map((location, index) => (
            <button
              key={location.id}
              className={`w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center gap-3 ${
                index === selectedIndex ? "bg-muted" : ""
              }`}
              onClick={() => selectSuggestion(location)}
            >
              <div className="flex-shrink-0">{getLocationIcon(location.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{location.name}</div>
                <div className="text-xs text-muted-foreground truncate">{location.description}</div>
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  )
}
