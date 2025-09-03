import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, Route, Activity, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { AuthUser } from "@/lib/auth"
import { AdminStats } from "./admin-stats"
import { RecentActivity } from "./recent-activity"

interface AdminDashboardProps {
  user: AuthUser
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Navigator
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.name}</p>
              </div>
            </div>
            <Badge variant="secondary">Administrator</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Stats Overview */}
          <AdminStats />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Manage campus navigation system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                  <Plus className="w-6 h-6" />
                  Add New Location
                </Button>
                <Link href="/admin/manage">
                  <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                    <Route className="w-6 h-6" />
                    Manage Pathways
                  </Button>
                </Link>
                <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                  <Users className="w-6 h-6" />
                  User Management
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity and Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Management
                </CardTitle>
                <CardDescription>Manage campus locations and pathways</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Student Center</p>
                    <p className="text-sm text-muted-foreground">Central hub location</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Library</p>
                    <p className="text-sm text-muted-foreground">Study and research facility</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Science Building</p>
                    <p className="text-sm text-muted-foreground">Laboratory and classroom complex</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button className="w-full bg-transparent" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Location
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
