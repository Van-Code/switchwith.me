import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProfileHeader } from "@/components/ProfileHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Sparkles } from "lucide-react"
import { isBoostEnabled } from "@/lib/features"
import Link from "next/link"

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const { id } = params

  // Fetch the user's public profile data
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      profile: {
        select: {
          firstName: true,
          lastInitial: true,
          avatarUrl: true,
          bio: true,
          successfulSwapsCount: true,
          favoritePlayer: true,
          emailVerified: true,
        },
      },
      listings: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10, // Show first 10 active listings
        include: {
          team: true,
        },
      },
    },
  })

  if (!user || !user.profile) {
    notFound()
  }

  const isOwnProfile = session?.user?.id === id

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
          isEmailVerified={user.profile.emailVerified}
        />
        {isOwnProfile && (
          <Link href="/profile/edit">
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm">
              Edit Profile
            </button>
          </Link>
        )}
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">User Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-600">Member since:</span>
            <span className="text-slate-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Active listings:</span>
            <span className="text-slate-900">{user.listings.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Successful swaps:</span>
            <span className="text-slate-900">{user.profile.successfulSwapsCount}</span>
          </div>
        </CardContent>
      </Card>

      {user.listings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Active Listings</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.listings.map((listing) => (
              <PublicListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PublicListingCard({ listing }: { listing: any }) {
  const formatGameDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  }

  return (
    <Card
      className={`border-slate-200 hover:shadow-md transition-shadow ${
        isBoostEnabled() && listing.boosted
          ? "border-2 border-amber-400 bg-gradient-to-br from-amber-50/50 to-transparent"
          : ""
      }`}
    >
      <CardHeader>
        {listing.team && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-slate-700">
              {listing.team.name}
            </span>
            {listing.listingType && (
              <Badge
                variant={listing.listingType === "HAVE" ? "default" : "outline"}
                className={
                  listing.listingType === "HAVE"
                    ? "bg-green-600 hover:bg-green-700"
                    : "border-blue-600 text-blue-600"
                }
              >
                {listing.listingType === "HAVE" ? "Has tickets" : "Wants tickets"}
              </Badge>
            )}
          </div>
        )}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-base font-semibold text-slate-900">
              {listing.haveZone}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Sec {listing.haveSection} • Row {listing.haveRow}
            </p>
          </div>
          {isBoostEnabled() && listing.boosted && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Boosted
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4" />
          {formatGameDate(listing.gameDate)}
        </div>
        {listing.wantZones.length > 0 && (
          <div>
            <p className="text-xs text-slate-600 mb-1">Wants:</p>
            <div className="flex flex-wrap gap-1">
              {listing.wantZones.map((zone: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {zone}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
