"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calendar, Sparkles, CheckCircle2 } from "lucide-react"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { isBoostEnabled, isShowListingActiveStatusEnabled } from "@/lib/features"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ShareListingButton } from "./ShareListingButton"
import { getListingBadges } from "@/lib/listings/getListingBadges"
import { getVisibleWantsPills } from "@/lib/listings/getVisibleWantsPills"

type BadgeIntent = "swap" | "forSale" | "lookingFor" | "flexible"
type BadgeVariant = "primary" | "subtle"

const badgeVariants: Record<BadgeIntent, Record<BadgeVariant, string>> = {
  swap: {
    primary:
      "bg-violet-600 text-white hover:bg-violet-700 border border-violet-600",
    subtle:
      "bg-violet-50 text-violet-800 border border-violet-200 text-xs",
  },

  forSale: {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600",
    subtle:
      "bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs",
  },

  lookingFor: {
    primary:
      "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50",
    subtle:
      "bg-white text-slate-700 border border-slate-200 text-xs",
  },

  flexible: {
    primary:
      "bg-slate-600 text-white hover:bg-slate-700 border border-slate-600 text-xs",
    subtle:
      "bg-slate-100 text-slate-700 border border-slate-200 text-xs",
  },
}

interface ListingCardProps {
  listing: {
    id: string
    gameDate: Date | string
    listingType?: string
    haveSection: string
    haveRow: string
    haveSeat: string
    haveZone: string
    wantZones: string[]
    wantSections: string[]
    status: string
    boosted?: boolean
    boostedAt?: Date | string | null
    priceCents?: number | null
    seatCount?: number | null
    flexible?: boolean
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
        emailVerified?: boolean
      } | null
    }
  }
  onMessage?: () => void
  isAuthenticated?: boolean
  badgeVariant?: "primary" | "subtle"
}

export function ListingCard({
  listing,
  onMessage,
  isAuthenticated = false,
  badgeVariant = "primary",
}: ListingCardProps) {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const gameDate = new Date(listing.gameDate)
  // Format date to avoid timezone issues - use UTC methods to display the date as-is
  const formatGameDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC", // Force UTC to prevent timezone shifts
    })
  }

  const handleSignInToMessage = async () => {
    setIsSigningIn(true)
    try {
      await signIn("google", {
        callbackUrl: `/listings/message?listingId=${listing.id}`,
      })
    } catch (error) {
      console.error("Sign in error:", error)
      setIsSigningIn(false)
    }
  }

  // Determine zone category for preview mode
  const getZoneCategory = (zone: string): string => {
    const zoneLower = zone.toLowerCase()
    if (zoneLower.includes("lower") || zoneLower.includes("floor")) return "Lower Bowl"
    if (zoneLower.includes("upper")) return "Upper Bowl"
    if (zoneLower.includes("club") || zoneLower.includes("suite")) return "Club/Suite"
    return "General Seating"
  }

  // Get badges
  const badges = getListingBadges(listing)

  // Format price
  const formatPrice = (priceCents: number | null | undefined): string | null => {
    if (!priceCents || priceCents <= 0) return null
    const dollars = priceCents / 100
    // Format without decimals if whole number, otherwise 2 decimals
    return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`
  }

  const priceDisplay = formatPrice(listing.priceCents)

  // Get visible wants pills with truncation
  const allWants = [...listing.wantZones, ...listing.wantSections]
  const { visible: visibleWants, overflowCount } = getVisibleWantsPills(allWants)

  // Map badge label to intent for color lookup
  const getBadgeIntent = (label: string): BadgeIntent => {
    if (label === "Swap") return "swap"
    if (label === "For Sale") return "forSale"
    if (label === "Looking For") return "lookingFor"
    if (label === "Flexible") return "flexible"
    return "lookingFor" // fallback
  }

  // Get badge className based on intent and variant
  const getBadgeClassName = (label: string, variant: BadgeVariant = badgeVariant) => {
    const intent = getBadgeIntent(label)
    return badgeVariants[intent][variant]
  }

  return (
    <Card
      className={`flex flex-col h-full ${
        isBoostEnabled() && listing.boosted
          ? "border-2 border-amber-400 bg-gradient-to-br from-amber-50/50 to-transparent shadow-lg"
          : ""
      }`}
    >
      <CardHeader>
        {listing.team && (
          <div className="flex items-center gap-2 mb-3">
            {listing.team.logoUrl && (
              <div className="relative w-6 h-6">
                <Image
                  src={listing.team.logoUrl}
                  alt={`${listing.team.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <span className="text-sm font-semibold text-slate-700">
              {listing.team.name}
            </span>
            {/* Primary badge */}
            <Badge className={getBadgeClassName(badges.primary)}>{badges.primary}</Badge>
            {/* Secondary badge */}
            {badges.secondary && (
              <Badge className={getBadgeClassName(badges.secondary)}>{badges.secondary}</Badge>
            )}
          </div>
        )}
        <div className="flex items-start justify-between">
          <div>
            {listing.listingType === "HAVE" || badges.primary !== "Looking For" ? (
              <>
                <CardTitle className="text-lg">
                  {isAuthenticated ? (
                    <>
                      Section {listing.haveSection}, Row {listing.haveRow}
                    </>
                  ) : (
                    <>{getZoneCategory(listing.haveZone)}</>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isAuthenticated ? (
                    <>
                      Seat {listing.haveSeat} • {listing.haveZone}
                    </>
                  ) : (
                    <>Sign in to see exact location</>
                  )}
                </p>
              </>
            ) : (
              <>
                <CardTitle className="text-lg">Looking for tickets</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {listing.wantZones.length > 0
                    ? listing.wantZones.join(", ")
                    : "Any zone"}
                </p>
              </>
            )}
            {/* Price display */}
            {priceDisplay && (
              <p className="text-lg font-bold text-emerald-700 mt-1">{priceDisplay}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            {isBoostEnabled() && listing.boosted && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Boosted
              </Badge>
            )}
            {isShowListingActiveStatusEnabled() && (
              <Badge variant={listing.status === "ACTIVE" ? "default" : "secondary"}>
                {listing.status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatGameDate(gameDate)}</span>
        </div>

        {/* Wants pills section with min-height for consistent card heights */}
        <div className="min-h-[60px]">
          {(visibleWants.length > 0 || overflowCount > 0) && (
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {badges.primary === "Looking For" ? "Looking for:" : "Wants:"}
              </p>
              <div className="flex flex-wrap gap-1">
                {visibleWants.length > 0 ? (
                  <>
                    {visibleWants.map((want, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {want}
                      </Badge>
                    ))}
                    {overflowCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        +{overflowCount}
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Any zone</span>
                )}
              </div>
            </div>
          )}
        </div>

        {isAuthenticated && listing.user?.profile && (
          <div className="pt-3 border-t">
            <span className="text-xs text-muted-foreground">Listed by</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Link
                href={`/users/${listing.user.id}`}
                className="text-sm font-medium hover:underline hover:text-cyan-700"
              >
                {listing.user.profile.firstName} {listing.user.profile.lastInitial}.
              </Link>
              {listing.user.profile.emailVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Email verified via Google</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {listing.status === "ACTIVE" && (
        <CardFooter className="flex gap-2 mt-auto">
          {!isAuthenticated ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleSignInToMessage}
                disabled={isSigningIn}
              >
                {isSigningIn ? "Signing in..." : "Sign in to Message"}
              </Button>
            </>
          ) : onMessage ? (
            <>
              <Button onClick={onMessage} className="flex-1">
                Message Owner
              </Button>
              <ShareListingButton
                listingId={listing.id}
                listingTitle={`${listing.team?.name || "Ticket"} - ${listing.haveZone}`}
              />
            </>
          ) : (
            <ShareListingButton
              listingId={listing.id}
              listingTitle={`${listing.team?.name || "Ticket"} - ${listing.haveZone}`}
              variant="outline"
              size="sm"
            />
          )}
        </CardFooter>
      )}
    </Card>
  )
}
