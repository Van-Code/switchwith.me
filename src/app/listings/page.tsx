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
import ListingsFilters from "../../components/listings-filters"

interface ListingsPageProps {
  searchParams?: {
    search?: string;
    sort?: string;
    section?: string;
    minPrice?: string;
    maxPrice?: string;
    from?: string;
    to?: string;
  };
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const session = await getServerSession(authOptions)

  // Get and sanitize all params
  const search = (searchParams?.search ?? "").trim();
  const sort = searchParams?.sort ?? "createdDesc";
  const section = (searchParams?.section ?? "").trim();
  const minPrice = searchParams?.minPrice;
  const maxPrice = searchParams?.maxPrice;
  const from = searchParams?.from;
  const to = searchParams?.to;

  // Build where clause with search filters
  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
  };

  // Text search across multiple fields
  if (search) {
    where.OR = [
      { haveSection: { contains: search, mode: "insensitive" } },
      { haveRow: { contains: search, mode: "insensitive" } },
      { haveSeat: { contains: search, mode: "insensitive" } },
      { haveZone: { contains: search, mode: "insensitive" } },
    ];
  }

  // Section filter
  if (section) {
    where.haveSection = { contains: section, mode: "insensitive" };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    where.faceValue = {};
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        where.faceValue.gte = min;
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        where.faceValue.lte = max;
      }
    }
  }

  // Date range filter
  if (from || to) {
    where.gameDate = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        where.gameDate.gte = fromDate;
      }
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        // Set to end of day
        toDate.setHours(23, 59, 59, 999);
        where.gameDate.lte = toDate;
      }
    }
  }

  // Build orderBy based on sort param
  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };

  switch (sort) {
    case "createdAsc":
      orderBy = { createdAt: "asc" };
      break;
    case "createdDesc":
      orderBy = { createdAt: "desc" };
      break;
    case "sectionAsc":
      orderBy = { haveSection: "asc" };
      break;
    case "gameSoonest":
      orderBy = { gameDate: "asc" };
      break;
    case "gameFarthest":
      orderBy = { gameDate: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy,
    include: {
      user: {
        select: {
          id: true,
        },
      },
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

  // Check if any filters are active
  const hasFilters = !!(search || section || minPrice || maxPrice || from || to || (sort && sort !== "createdDesc"));
  const filterCount = [search, section, minPrice, maxPrice, from, to].filter(Boolean).length;

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

        <ListingsFilters
          currentSearch={search}
          currentSort={sort}
          currentSection={section}
          currentMinPrice={minPrice}
          currentMaxPrice={maxPrice}
          currentFrom={from}
          currentTo={to}
        />

        {hasFilters && (
          <div className="text-sm text-slate-600">
            Found {serializedListings.length} {serializedListings.length === 1 ? 'listing' : 'listings'}
            {search && <> matching &ldquo;{search}&rdquo;</>}
            {filterCount > 0 && <> with {filterCount} {filterCount === 1 ? 'filter' : 'filters'} applied</>}
          </div>
        )}
      </div>

      {serializedListings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">
            {hasFilters ? `No listings found matching your criteria.` : "No active listings yet."}
          </p>
          {!hasFilters && (
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
