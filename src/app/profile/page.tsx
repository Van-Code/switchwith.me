import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "../../lib/prisma"
import { ProfileHeader } from "../../components/ProfileHeader"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import Link from "next/link"
import { Edit, MapPin } from "lucide-react"

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

  const activeListings = user.listings.filter((l:{status:string}) => l.status === "ACTIVE")
  const inactiveListings = user.listings.filter((l:{status:string}) => l.status === "INACTIVE")
  const matchedListings = user.listings.filter((l:{status:string}) => l.status === "MATCHED")

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
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member since:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total listings:</span>
            <span>{user.listings.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active listings:</span>
            <span>{activeListings.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Inactive listings:</span>
            <span>{inactiveListings.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed swaps:</span>
            <span>{user.profile.successfulSwapsCount}</span>
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
  matchedListings 
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
          <h2 className="text-2xl font-bold">Your Active Listings</h2>
          <Link href="/listings/new">
            <Button>Create New Listing</Button>
          </Link>
        </div>

        {activeListings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              You don't have any active listings.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeListings.map((listing:any) => (
              <MyListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* Inactive Listings */}
      {inactiveListings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Inactive Listings</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveListings.map((listing:any) => (
              <MyListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Swaps */}
      {matchedListings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Completed Swaps</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedListings.map((listing:any) => (
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">
              Sec {listing.haveSection} • Row {listing.haveRow} • Seat {listing.haveSeat}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{listing.haveZone}</p>
          </div>
          <ListingStatusBadge status={listing.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {new Date(listing.gameDate).toLocaleDateString()}
        </div>
        <ListingStatusToggle listingId={listing.id} currentStatus={listing.status} />
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

  return (
    <Badge variant={variants[status] || "secondary"}>
      {status}
    </Badge>
  )
}

function ListingStatusToggle({ listingId, currentStatus }: { listingId: string, currentStatus: string }) {
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