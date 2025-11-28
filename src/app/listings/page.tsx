import React from "react";
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib//auth"
import { prisma } from "../../lib//prisma"
import { Button } from "../../components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ListingsClient } from "./ListingsClient"
import { Map } from "lucide-react"
import { isSeatMapEnabled } from "../../lib//features"

export default async function ListingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/signin")
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

  // Serialize dates to strings
  const serializedListings = listings.map((listing:any)=> ({
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Browse Listings</h1>
          <p className="text-slate-600">Find tickets to swap</p>
        </div>
        <div className="flex gap-2">
          {isSeatMapEnabled() && (
            <Link href="/listings/map">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                <Map className="h-4 w-4 mr-2" />
                Map View
              </Button>
            </Link>
          )}
          <Link href="/listings/new">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Create Listing</Button>
          </Link>
        </div>
      </div>

      {serializedListings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">No active listings yet.</p>
          <Link href="/listings/new">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Be the first to create one!</Button>
          </Link>
        </div>
      ) : (
        <ListingsClient listings={serializedListings} currentUserId={session.user.id} />
      )}
    </div>
  )
}