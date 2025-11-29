import React from "react";
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib//auth"
import { prisma } from "../../lib//prisma"
import { Button } from "../../components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ListingsClient } from "./ListingsClient"
import { Prisma } from "@prisma/client"
import ListingsFilters from "../../components/listings-filters"
import ListingsSortSelect from "../../components/listings-sort-select"

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
        // Set to start of day
        fromDate.setHours(0, 0, 0, 0);
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
          profile: {
            select: {
              firstName: true,
              lastInitial: true,
            },
          },
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-orange-50">
      <div className="space-y-6 pb-12">
        {/* Page header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                  Browse Listings
                </h1>
                <p className="text-slate-600 mt-1">Find tickets to swap</p>
              </div>
              <Link href="/listings/new">
                <Button className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-md">
                  Create Listing
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content: Sidebar + Listings grid */}
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Left sidebar: Filters */}
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <ListingsFilters
                currentSearch={search}
                currentSort={sort}
                currentSection={section}
                currentMinPrice={minPrice}
                currentMaxPrice={maxPrice}
                currentFrom={from}
                currentTo={to}
              />
            </aside>

            {/* Right column: Sort + Listings */}
            <div className="space-y-4">
              {/* Toolbar with result count and sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
                <div className="text-sm text-slate-600">
                  {hasFilters ? (
                    <>
                      Found <span className="font-semibold text-slate-900">{serializedListings.length}</span>{" "}
                      {serializedListings.length === 1 ? "listing" : "listings"}
                      {search && <> matching <span className="font-semibold">&ldquo;{search}&rdquo;</span></>}
                      {filterCount > 0 && (
                        <> with <span className="font-semibold">{filterCount}</span> {filterCount === 1 ? "filter" : "filters"} applied</>
                      )}
                    </>
                  ) : (
                    <>
                      Showing <span className="font-semibold text-slate-900">{serializedListings.length}</span>{" "}
                      {serializedListings.length === 1 ? "listing" : "listings"}
                    </>
                  )}
                </div>
                <ListingsSortSelect currentSort={sort} />
              </div>

              {/* Listings grid or empty state */}
              {serializedListings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="max-w-md mx-auto px-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-orange-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-slate-900 mb-2">
                      {hasFilters ? "No listings found" : "No active listings yet"}
                    </p>
                    <p className="text-slate-600 mb-6">
                      {hasFilters
                        ? "Try adjusting your filters or search criteria."
                        : "Be the first to create a listing!"}
                    </p>
                    {!hasFilters && (
                      <Link href="/listings/new">
                        <Button className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white">
                          Create a Listing
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <ListingsClient listings={serializedListings} currentUserId={session?.user?.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
