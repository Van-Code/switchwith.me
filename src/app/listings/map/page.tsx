import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "../../../lib/prisma"
import { MapPageClient } from "./MapPageClient"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import { ArrowLeft, Grid3x3 } from "lucide-react"
import { isSeatMapEnabled } from "../../../lib/features"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"

export default async function MapPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // Check if seat map feature is enabled
  if (!isSeatMapEnabled()) {
    return (
      <div className="max-w-2xl mx-auto mt-12 px-4">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900">Seat Map View Disabled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              The interactive seat map view is currently disabled. Please use the grid view to browse available listings.
            </p>
            <Link href="/listings">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                <Grid3x3 className="h-4 w-4 mr-2" />
                Go to Grid View
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  
  
  // Serialize dates
  const serializedListings = listings.map((listing:any) => ({
    ...listing,
    gameDate: listing.gameDate.toISOString(),
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
    user: listing.user ? {
      ...listing.user,
      createdAt: listing.user.createdAt.toISOString(),
      updatedAt: listing.user.updatedAt.toISOString(),
      profile: listing.user.profile ? {
        ...listing.user.profile,
        createdAt: listing.user.profile.createdAt.toISOString(),
        updatedAt: listing.user.profile.updatedAt.toISOString(),
      } : null
    } : undefined
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/listings">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Seat Map</h1>
            <p className="text-slate-600">
              Interactive Chase Center seat map • {serializedListings.length} active listings
            </p>
          </div>
        </div>
        <Link href="/listings">
          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            <Grid3x3 className="h-4 w-4 mr-2" />
            Grid View
          </Button>
        </Link>
      </div>

      <MapPageClient
        listings={serializedListings}
        currentUserId={session.user.id}
      />
    </div>
  )
}