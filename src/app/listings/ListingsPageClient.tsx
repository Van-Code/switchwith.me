"use client";

import { useState, useEffect } from "react";
import { ListingsFiltersProvider, useListingsFilters } from "@/contexts/listings-filters-context";
import ListingsFilters from "@/components/listings-filters";
import ListingsSortSelect from "@/components/listings-sort-select";
import { ListingsClient } from "./ListingsClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ListingsPageClientProps {
  currentUserId?: string;
}

function ListingsContent({ currentUserId }: ListingsPageClientProps) {
  const { activeFilters } = useListingsFilters();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch listings whenever active filters change
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();

        if (activeFilters.team.length > 0) params.set("team", activeFilters.team.join(","));
        if (activeFilters.section) params.set("section", activeFilters.section);
        if (activeFilters.minPrice) params.set("minPrice", activeFilters.minPrice);
        if (activeFilters.maxPrice) params.set("maxPrice", activeFilters.maxPrice);
        if (activeFilters.from) params.set("from", activeFilters.from);
        if (activeFilters.to) params.set("to", activeFilters.to);
        if (activeFilters.sort) params.set("sort", activeFilters.sort);

        const query = params.toString();
        const url = query ? `/api/listings?${query}` : "/api/listings";

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setListings(data.listings || []);
        } else {
          console.error("Failed to fetch listings");
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [activeFilters]);

  const hasFilters = !!(
    activeFilters.team.length > 0 ||
    activeFilters.section ||
    activeFilters.minPrice ||
    activeFilters.maxPrice ||
    activeFilters.from ||
    activeFilters.to
  );

  const filterCount = [
    activeFilters.team.length > 0,
    activeFilters.section,
    activeFilters.minPrice,
    activeFilters.maxPrice,
    activeFilters.from,
    activeFilters.to,
  ].filter(Boolean).length;

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
              <ListingsFilters />
            </aside>

            {/* Right column: Sort + Listings */}
            <div className="space-y-4">
              {/* Toolbar with result count and sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
                <div className="text-sm text-slate-600">
                  {isLoading ? (
                    "Loading..."
                  ) : hasFilters ? (
                    <>
                      Found <span className="font-semibold text-slate-900">{listings.length}</span>{" "}
                      {listings.length === 1 ? "listing" : "listings"}
                      {filterCount > 0 && (
                        <>
                          {" "}
                          with <span className="font-semibold">{filterCount}</span>{" "}
                          {filterCount === 1 ? "filter" : "filters"} applied
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      Showing <span className="font-semibold text-slate-900">{listings.length}</span>{" "}
                      {listings.length === 1 ? "listing" : "listings"}
                    </>
                  )}
                </div>
                <ListingsSortSelect />
              </div>

              {/* Listings grid or empty state */}
              {isLoading ? (
                <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="max-w-md mx-auto px-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-orange-100 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-lg font-medium text-slate-900 mb-2">Loading listings...</p>
                  </div>
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="max-w-md mx-auto px-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-orange-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-slate-900 mb-2">
                      {hasFilters ? "No listings found" : "No active listings yet"}
                    </p>
                    <p className="text-slate-600 mb-6">
                      {hasFilters ? "Try adjusting your filters or search criteria." : "Be the first to create a listing!"}
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
                <ListingsClient listings={listings} currentUserId={currentUserId} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component that provides the context
export function ListingsPageClient({ currentUserId }: ListingsPageClientProps) {
  return (
    <ListingsFiltersProvider>
      <ListingsContent currentUserId={currentUserId} />
    </ListingsFiltersProvider>
  );
}
