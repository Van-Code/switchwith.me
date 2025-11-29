import React from "react";
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib//auth"
import { prisma } from "../../lib//prisma"
import { Button } from "../../components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ListingsClient } from "./ListingsClient"

export default async function ListingsPage() {
  const session = await getServerSession(authOptions)

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      user: {
        select: {
          id: true,
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
        <ListingsClient listings={serializedListings} currentUserId={session?.user?.id} />
      )}
    </div>
  )
}