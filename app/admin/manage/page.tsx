import { getCurrentUser, isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PathManagement } from "@/components/admin/path-management"

export default async function ManagePage() {
  const user = await getCurrentUser()

  if (!user || !isAdmin(user)) {
    redirect("/")
  }

  return <PathManagement user={user} />
}
