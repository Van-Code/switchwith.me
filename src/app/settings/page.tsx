import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NotificationSettings } from "@/components/notification-settings"
import { DeleteAccountSection } from "@/components/DeleteAccountSection"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      listings: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  })

  if (!user || !user.profile) {
    redirect("/auth/signin")
  }

  const activeListings = user.listings.filter(
    (l: { status: string }) => l.status === "ACTIVE"
  )
  const inactiveListings = user.listings.filter(
    (l: { status: string }) => l.status === "INACTIVE"
  )
  const matchedListings = user.listings.filter(
    (l: { status: string }) => l.status === "MATCHED"
  )

  return (
    <div className="space-y-8">
      <NotificationSettings
        initialEmailNotificationsEnabled={user.emailNotificationsEnabled}
      />

      <DeleteAccountSection />
    </div>
  )
}
