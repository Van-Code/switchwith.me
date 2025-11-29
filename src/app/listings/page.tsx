import React from "react";
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib//auth"
import { prisma } from "../../lib//prisma"
import { Button } from "../../components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ListingsClient } from "./ListingsClient"
import { Prisma } from "@prisma/client"
import ListingsSearchBar from "../../components/listings-search-bar"

interface ListingsPageProps {
  searchParams?: { search?: string };
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const session = await getServerSession(authOptions)

  // Get and sanitize search term
  const search = (searchParams?.search ?? "").trim();

  // Build where clause with search filters
  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
  };

  if (search) {
    where.OR = [
      { haveSection: { contains: search, mode: "insensitive" } },
      { haveRow: { contains: search, mode: "insensitive" } },
      { haveSeat: { contains: search, mode: "insensitive" } },
      { haveZone: { contains: search, mode: "insensitive" } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
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
      <div className="flex flex-col gap-4">
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

        <ListingsSearchBar />

        {search && (
          <div className="text-sm text-slate-600">
            Found {serializedListings.length} {serializedListings.length === 1 ? 'listing' : 'listings'} matching &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {serializedListings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">
            {search ? `No listings found matching "${search}".` : "No active listings yet."}
          </p>
          {!search && (
            <Link href="/listings/new">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Be the first to create one!</Button>
            </Link>
          )}
        </div>
      ) : (
        <ListingsClient listings={serializedListings} currentUserId={session?.user?.id} />
      )}
    </div>
  )
}