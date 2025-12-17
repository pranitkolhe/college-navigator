import { getCurrentUser, isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || !isAdmin(user)) {
    redirect("/")
  }

  return <AdminDashboard user={user} />
}
