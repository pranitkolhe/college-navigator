import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, MapPin, Route } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "user_registered",
      description: "New user registered: john.doe@student.edu",
      timestamp: "2 minutes ago",
      icon: User,
      badge: "New User",
    },
    {
      id: 2,
      type: "location_added",
      description: "Added new location: Engineering Building",
      timestamp: "1 hour ago",
      icon: MapPin,
      badge: "Location",
    },
    {
      id: 3,
      type: "pathway_updated",
      description: "Updated pathway: Library to Gym",
      timestamp: "3 hours ago",
      icon: Route,
      badge: "Pathway",
    },
    {
      id: 4,
      type: "user_registered",
      description: "New user registered: sarah.smith@student.edu",
      timestamp: "5 hours ago",
      icon: User,
      badge: "New User",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest system updates and user activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-accent/10 rounded-full">
                  <IconComponent className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {activity.badge}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
