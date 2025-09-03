import { NavigationForm } from "@/components/navigation-form"
import { MapPin } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { ClientHeader } from "@/components/client-header"

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ClientHeader user={user} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mx-auto mb-4">
              <MapPin className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {user ? `Welcome back, ${user.name.split(" ")[0]}!` : "Where do you need to go?"}
            </h2>
            <p className="text-muted-foreground text-lg">
              Enter your starting point and destination to get walking directions across campus
            </p>
          </div>

          {/* Navigation Form */}
          <NavigationForm />

          {/* Quick Links */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4">Popular Destinations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "Library",
                "Student Center",
                "Cafeteria",
                "Gym",
                "Admin Building",
                "Parking Lot A",
                "Science Building",
                "Dormitories",
              ].map((location) => (
                <button
                  key={location}
                  className="p-3 text-sm bg-card border border-border rounded-lg hover:bg-accent/5 hover:border-accent/20 transition-colors text-card-foreground"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Need help? Contact Campus Services at (555) 123-4567</p>
            <p className="mt-1">© 2025 Campus Navigator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
