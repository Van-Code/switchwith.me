"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ListingsFiltersProvider, useListingsFilters } from "@/contexts/listings-filters-context";
import ListingsFilters from "@/components/listings-filters";
import ListingsSortSelect from "@/components/listings-sort-select";
import { ListingsClient } from "./ListingsClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ListingsPageClientProps {
  currentUserId?: string;
}

function ListingsContent({ currentUserId }: ListingsPageClientProps) {
  const { activeFilters } = useListingsFilters();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!currentUserId;
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Handle error query params and show toast notifications
  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    switch (error) {
      case "missing_listing":
        toast({
          title: "Invalid Request",
          description: "The listing you're trying to access is invalid or missing.",
          variant: "destructive",
        });
        break;
      case "listing_not_found":
        toast({
          title: "Listing Not Found",
          description: "That listing is no longer available, but here are similar options.",
          variant: "destructive",
        });
        break;
      case "listing_inactive":
        toast({
          title: "Listing No Longer Available",
          description: "That listing is no longer active, but here are similar options.",
          variant: "destructive",
        });
        break;
      case "own_listing":
        toast({
          title: "Cannot Message Own Listing",
          description: "You cannot start a conversation with yourself.",
          variant: "destructive",
        });
        break;
      case "server_error":
        toast({
          title: "Server Error",
          description: "Something went wrong. Please try again later.",
          variant: "destructive",
        });
        break;
      case "insufficient_credits":
        const required = searchParams.get("required") || "1";
        const current = searchParams.get("current") || "0";
        toast({
          title: "Insufficient Credits",
          description: `You need ${required} credit(s) to start a conversation, but you only have ${current}.`,
          variant: "destructive",
        });
        break;
      case "missing_params":
        toast({
          title: "Invalid Request",
          description: "Missing required parameters. Please try again.",
          variant: "destructive",
        });
        break;
      default:
        break;
    }

    // Clean up URL by removing error params (optional, for better UX)
    if (error) {
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      url.searchParams.delete("team");
      url.searchParams.delete("required");
      url.searchParams.delete("current");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, toast]);

  // Fetch listings whenever active filters change
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();

        if (activeFilters.team.length > 0) params.set("team", activeFilters.team.join(","));
        if (activeFilters.section) params.set("section", activeFilters.section);
        if (activeFilters.listingType) params.set("listingType", activeFilters.listingType);
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

  // For unauthenticated users, limit to first 6 listings
  const displayedListings = !isAuthenticated ? listings.slice(0, 6) : listings;
  const totalListings = listings.length;

  const hasFilters = !!(
    activeFilters.team.length > 0 ||
    activeFilters.section ||
    activeFilters.listingType ||
    activeFilters.from ||
    activeFilters.to
  );

  const filterCount = [
    activeFilters.team.length > 0,
    activeFilters.section,
    activeFilters.listingType,
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
              {/* Sign-in CTA for unauthenticated users */}
              {!isAuthenticated && totalListings > 0 && (
                <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-lg border border-cyan-800 px-6 py-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-white">
                      <h3 className="font-bold text-lg mb-1">You're viewing a preview of real listings</h3>
                      <p className="text-cyan-50 text-sm">
                        Sign in with Google to unlock full details, see all {totalListings} listings, and start swapping seats for free.
                      </p>
                    </div>
                    <Button
                      onClick={() => signIn("google", { callbackUrl: "/listings" })}
                      className="bg-white text-cyan-700 hover:bg-cyan-50 font-semibold shadow-md whitespace-nowrap"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign in with Google
                    </Button>
                  </div>
                </div>
              )}

              {/* Toolbar with result count and sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
                <div className="text-sm text-slate-600">
                  {isLoading ? (
                    "Loading..."
                  ) : hasFilters ? (
                    <>
                      {!isAuthenticated && totalListings > displayedListings.length ? (
                        <>
                          Showing <span className="font-semibold text-slate-900">{displayedListings.length}</span> of{" "}
                          <span className="font-semibold text-slate-900">{totalListings}</span> {totalListings === 1 ? "listing" : "listings"}
                        </>
                      ) : (
                        <>
                          Found <span className="font-semibold text-slate-900">{displayedListings.length}</span>{" "}
                          {displayedListings.length === 1 ? "listing" : "listings"}
                          {filterCount > 0 && (
                            <>
                              {" "}
                              with <span className="font-semibold">{filterCount}</span>{" "}
                              {filterCount === 1 ? "filter" : "filters"} applied
                            </>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {!isAuthenticated && totalListings > displayedListings.length ? (
                        <>
                          Showing <span className="font-semibold text-slate-900">{displayedListings.length}</span> of{" "}
                          <span className="font-semibold text-slate-900">{totalListings}</span> {totalListings === 1 ? "listing" : "listings"}
                        </>
                      ) : (
                        <>
                          Showing <span className="font-semibold text-slate-900">{displayedListings.length}</span>{" "}
                          {displayedListings.length === 1 ? "listing" : "listings"}
                        </>
                      )}
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
              ) : displayedListings.length === 0 ? (
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
                    {!hasFilters && isAuthenticated && (
                      <Link href="/listings/new">
                        <Button className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white">
                          Create a Listing
                        </Button>
                      </Link>
                    )}
                    {!hasFilters && !isAuthenticated && (
                      <Button
                        onClick={() => signIn("google", { callbackUrl: "/listings" })}
                        className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign in to create listings
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <ListingsClient listings={displayedListings} currentUserId={currentUserId} />
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
