"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Calendar, DollarSign, MapPin, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"

interface Listing {
  id: string
  gameDate: Date | string
  haveSection: string
  haveRow: string
  haveSeat: string
  haveZone: string
  faceValue: number
  wantZones: string[]
  wantSections: string[]
  status: string
  boosted?: boolean
  team?: {
    id: number
    name: string
    slug: string
    logoUrl: string | null
  }
  user?: {
    id: string
    profile?: {
      firstName: string
      lastInitial: string | null
    } | null
  }
}

interface RelatedListingsProps {
  listingId: string
  currentUserId?: string
}

export function RelatedListings({ listingId, currentUserId }: RelatedListingsProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedListings = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}/related`)
        if (response.ok) {
          const data = await response.json()
          setListings(data.listings || [])
        }
      } catch (error) {
        console.error("Error fetching related listings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedListings()
  }, [listingId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Related Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (listings.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Related Listings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Similar listings you might be interested in
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {listings.map((listing) => {
          const gameDate = new Date(listing.gameDate)
          const isOwnListing = currentUserId && listing.user?.id === currentUserId

          return (
            <div
              key={listing.id}
              className={`border rounded-lg p-3 hover:bg-muted/50 transition-colors ${
                listing.boosted ? "border-amber-400 bg-amber-50/30" : ""
              }`}
            >
              {/* Team info */}
              {listing.team && (
                <div className="flex items-center gap-2 mb-2">
                  {listing.team.logoUrl && (
                    <div className="relative w-4 h-4">
                      <Image
                        src={listing.team.logoUrl}
                        alt={`${listing.team.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700">
                    {listing.team.name}
                  </span>
                  {listing.boosted && (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white h-5 text-[10px]">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                      Boosted
                    </Badge>
                  )}
                </div>
              )}

              {/* Location */}
              <div className="mb-2">
                <p className="font-semibold text-sm">
                  Section {listing.haveSection}, Row {listing.haveRow}, Seat {listing.haveSeat}
                </p>
                <p className="text-xs text-muted-foreground">{listing.haveZone}</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">
                    {gameDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span>${listing.faceValue.toFixed(0)}</span>
                </div>
              </div>

              {/* Wants */}
              {(listing.wantZones.length > 0 || listing.wantSections.length > 0) && (
                <div className="mb-3">
                  <p className="text-xs font-medium mb-1">Wants:</p>
                  <div className="flex flex-wrap gap-1">
                    {listing.wantZones.slice(0, 2).map((zone, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] h-5">
                        {zone.length > 15 ? zone.substring(0, 15) + "..." : zone}
                      </Badge>
                    ))}
                    {listing.wantSections.slice(0, 2).map((section, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] h-5">
                        Sec {section}
                      </Badge>
                    ))}
                    {listing.wantZones.length + listing.wantSections.length > 4 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{listing.wantZones.length + listing.wantSections.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action button */}
              <Link href={`/listings?highlight=${listing.id}`} className="block">
                <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                  {isOwnListing ? "View Your Listing" : "View Details"}
                </Button>
              </Link>
            </div>
          )
        })}

        {listings.length > 0 && (
          <Link href="/listings" className="block mt-4">
            <Button variant="ghost" className="w-full text-sm">
              Browse All Listings
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
