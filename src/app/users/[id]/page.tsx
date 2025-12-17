import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProfileHeader } from "@/components/ProfileHeader"
import { ProfilePhotoStrip } from "@/components/ProfilePhotoStrip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Sparkles } from "lucide-react"
import { isBoostEnabled } from "@/lib/features"
import Link from "next/link"

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const { id } = params

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
          successfulSwapsCount: true,
          emailVerified: true,
        },
      },
      profilePhotos: {
        orderBy: { order: "asc" },
      },
      listings: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { team: true },
      },
    },
  })

  if (!user || !user.profile) notFound()

  const isOwnProfile = session?.user?.id === id

  const memberSince = new Date(user.createdAt).toLocaleDateString()
  const activeListingsCount = user.listings.length

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <ProfileHeader
            firstName={user.profile.firstName}
            lastInitial={user.profile.lastInitial}
            avatarUrl={user.profile.avatarUrl}
            successfulSwapsCount={user.profile.successfulSwapsCount}
            isEmailVerified={user.profile.emailVerified}
          />

          {/* Stat chips live under the name */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              Member since {memberSince}
            </Badge>

            <Badge variant="outline" className="text-xs">
              Active listings {activeListingsCount}
            </Badge>

            <Badge variant="outline" className="text-xs">
              Successful swaps {user.profile.successfulSwapsCount}
            </Badge>
          </div>
        </div>

        {isOwnProfile && (
          <Link href="/profile/edit" className="shrink-0">
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm">
              Edit Profile
            </button>
          </Link>
        )}
      </div>

      {/* Main content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Listings and photos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active listings preview */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900">Active Listings</CardTitle>
                <Link
                  href={`/listings?userId=${user.id}`}
                  className="text-sm text-cyan-700 hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              {user.listings.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.listings.map((listing) => (
                    <PublicListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  No active listings yet.
                  {isOwnProfile ? (
                    <>
                      {" "}
                      <Link
                        href="/listings/create"
                        className="text-cyan-700 hover:underline"
                      >
                        Create one
                      </Link>
                      .
                    </>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              {user.profilePhotos && user.profilePhotos.length > 0 ? (
                <ProfilePhotoStrip
                  photos={user.profilePhotos}
                  isOwnProfile={isOwnProfile}
                  reportedUserId={!isOwnProfile ? user.id : undefined}
                />
              ) : (
                <div className="text-sm text-slate-600">
                  This user hasn’t added profile photos.
                  {isOwnProfile ? (
                    <>
                      {" "}
                      <Link
                        href="/profile/edit"
                        className="text-cyan-700 hover:underline"
                      >
                        Add photos
                      </Link>
                      .
                    </>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: compact “signals” column */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900">Trust Signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Email verified</span>
                <span className="font-medium">
                  {user.profile.emailVerified ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Successful swaps</span>
                <span className="font-medium">{user.profile.successfulSwapsCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Member since</span>
                <span className="font-medium">{memberSince}</span>
              </div>
            </CardContent>
          </Card>

          {/* Optional empty filler that still feels legit */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900">Community</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Tip: Profiles with photos feel more human, but they’re always optional.
            </CardContent>
          </Card>
        </div>
      </div>
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
      <CardHeader className="pb-3">
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
                {listing.listingType === "HAVE" ? "Has" : "Wants"}
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-base font-semibold text-slate-900">{listing.haveZone}</p>
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

        {listing.wantZones?.length > 0 && (
          <div>
            <p className="text-xs text-slate-600 mb-1">Wants</p>
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
