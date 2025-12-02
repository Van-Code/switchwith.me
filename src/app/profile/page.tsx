import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfileHeader } from "@/components/ProfileHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationSettings } from "@/components/notification-settings"
import { DeleteAccountSection } from "@/components/DeleteAccountSection"
import Link from "next/link"
import { Edit, MapPin, Sparkles } from "lucide-react"

export default async function ProfilePage() {
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
          createdAt: "desc",
        },
      },
    },
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
      <div className="flex justify-between items-start">
        <ProfileHeader
          firstName={user.profile.firstName}
          lastInitial={user.profile.lastInitial}
          avatarUrl={user.profile.avatarUrl}
          bio={user.profile.bio}
          successfulSwapsCount={user.profile.successfulSwapsCount}
          favoritePlayer={user.profile.favoritePlayer}
        />
        <Link href="/profile/edit">
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-600">Email:</span>
            <span className="text-slate-900">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Member since:</span>
            <span className="text-slate-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Total listings:</span>
            <span className="text-slate-900">{user.listings.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Active listings:</span>
            <span className="text-slate-900">{activeListings.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Inactive listings:</span>
            <span className="text-slate-900">{inactiveListings.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Completed swaps:</span>
            <span className="text-slate-900">{user.profile.successfulSwapsCount}</span>
          </div>
        </CardContent>
      </Card>

      <MyListingsSection
        activeListings={activeListings}
        inactiveListings={inactiveListings}
        matchedListings={matchedListings}
      />
    </div>
  )
}

function MyListingsSection({
  activeListings,
  inactiveListings,
  matchedListings,
}: {
  activeListings: any[]
  inactiveListings: any[]
  matchedListings: any[]
}) {
  return (
    <>
      {/* Active Listings */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Your Active Listings</h2>
          <Link href="/listings/new">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              Create New Listing
            </Button>
          </Link>
        </div>

        {activeListings.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-8 text-center text-slate-600">
              You don't have any active listings.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeListings.map((listing: any) => (
              <MyListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* Inactive Listings */}
      {inactiveListings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Inactive Listings</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveListings.map((listing: any) => (
              <MyListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Swaps */}
      {matchedListings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Completed Swaps</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedListings.map((listing: any) => (
              <MyListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function MyListingCard({ listing }: { listing: any }) {
  return (
    <Card className={`border-slate-200 hover:shadow-md transition-shadow ${
      listing.boosted ? "border-2 border-amber-400 bg-gradient-to-br from-amber-50/50 to-transparent" : ""
    }`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base text-slate-900">
              Sec {listing.haveSection} • Row {listing.haveRow} • Seat {listing.haveSeat}
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">{listing.haveZone}</p>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            {listing.boosted && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Boosted
              </Badge>
            )}
            <ListingStatusBadge status={listing.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4" />
          {new Date(listing.gameDate).toLocaleDateString()}
        </div>
        <ListingStatusToggle listingId={listing.id} currentStatus={listing.status} />
        {listing.status === "ACTIVE" && !listing.boosted && (
          <BoostListingButton listingId={listing.id} />
        )}
      </CardContent>
    </Card>
  )
}

function ListingStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    ACTIVE: "default",
    INACTIVE: "secondary",
    MATCHED: "outline",
    EXPIRED: "outline",
  }

  return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
}

function ListingStatusToggle({
  listingId,
  currentStatus,
}: {
  listingId: string
  currentStatus: string
}) {
  if (currentStatus === "MATCHED" || currentStatus === "EXPIRED") {
    return null
  }

  return (
    <form action={`/api/listings/${listingId}/status`} method="POST">
      <ListingStatusToggleClient listingId={listingId} currentStatus={currentStatus} />
    </form>
  )
}

// Client component for the toggle button
import { ListingStatusToggleClient } from "@/components/ListingStatusToggleClient"
import { BoostListingButton } from "@/components/BoostListingButton"
