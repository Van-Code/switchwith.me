import { requireUserId } from "@/lib/auth-api"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditProfileForm } from "./EditProfileForm"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditProfilePage() {
  const auth = await requireUserId()
  if (!auth.ok) {
    redirect("/auth/signin")
  }

  const userId = auth.userId
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      profilePhotos: {
        orderBy: {
          order: "asc",
        },
      },
    },
  })

  if (!user || !user.profile) {
    redirect("/auth/signin")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-slate-600">Update your personal information</p>
        </div>
      </div>

      <EditProfileForm user={user} />
    </div>
  )
}
