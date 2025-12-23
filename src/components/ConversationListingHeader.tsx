import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowLeftRight, User } from "lucide-react"
import { getInteractionIntent } from "@/lib/listings/getInteractionIntent"
import { getListingBadges } from "@/lib/listings/getListingBadges"
import {
  getViewerAndOtherListing,
  ParticipantWithListings,
} from "@/lib/listings/getViewerAndOtherListing"

type BadgeIntent = "swap" | "forSale" | "lookingFor" | "flexible"
type BadgeVariant = "primary" | "subtle"

const badgeVariants: Record<BadgeIntent, Record<BadgeVariant, string>> = {
  swap: {
    primary: "bg-violet-600 text-white hover:bg-violet-700 border border-violet-600",
    subtle: "bg-violet-50 text-violet-800 border border-violet-200 text-xs",
  },

  forSale: {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600",
    subtle: "bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs",
  },

  lookingFor: {
    primary: "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50",
    subtle: "bg-white text-slate-700 border border-slate-200 text-xs",
  },

  flexible: {
    primary: "bg-slate-600 text-white hover:bg-slate-700 border border-slate-600 text-xs",
    subtle: "bg-slate-100 text-slate-700 border border-slate-200 text-xs",
  },
}

const intentLabels: Record<BadgeIntent, string> = {
  swap: "Swap",
  forSale: "For Sale",
  lookingFor: "Looking For",
  flexible: "Flexible",
}

interface ConversationListingHeaderProps {
  listing: {
    listingType: string
    haveSection: string
    haveRow: string
    haveSeat: string
    haveZone: string
    wantZones: string[]
    wantSections: string[]
    gameDate: Date | string
    gameId?: string | null
    teamId?: number
    flexible?: boolean
  }
  participants?: ParticipantWithListings[]
  currentUserId?: string
}

export function ConversationListingHeader({
  listing,
  participants,
  currentUserId,
}: ConversationListingHeaderProps) {
  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h2 className="text-lg font-semibold">Missing listing</h2>
        <p className="text-sm text-muted-foreground mt-2">
          This conversation is missing its associated listing.
        </p>
      </div>
    )
  }

  if (!participants || !currentUserId) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center italic">
            Conversation participants not loaded, cannot resolve both listings.
          </p>
        </CardContent>
      </Card>
    )
  }

  const gameDate = new Date(listing.gameDate)
  // Explicitly get viewer and other listings
  const { viewerListing, otherListing } =
    participants && currentUserId
      ? getViewerAndOtherListing({
          participants,
          currentUserId,
          conversationTeamId: listing.teamId,
          conversationGameDate: listing.gameDate,
        })
      : { viewerListing: null, otherListing: null }

  // Calculate interaction intent if we have both listings
  let interactionIntent: "swap" | "forSale" | "lookingFor" | null = null
  let showFlexibleBadge = false

  if (viewerListing && otherListing) {
    interactionIntent = getInteractionIntent({
      viewerListing,
      otherListing,
    })

    // Check for Flexible badge
    const viewerBadges = getListingBadges(viewerListing)
    const otherBadges = getListingBadges(otherListing)
    showFlexibleBadge =
      viewerBadges.secondary === "Flexible" || otherBadges.secondary === "Flexible"
  } else if (viewerListing || otherListing) {
    // Fallback: infer from single listing
    const singleListing = viewerListing || otherListing
    const badges = getListingBadges(singleListing!)
    interactionIntent =
      badges.primary === "Swap"
        ? "swap"
        : badges.primary === "For Sale"
          ? "forSale"
          : "lookingFor"
    showFlexibleBadge = badges.secondary === "Flexible"
  }

  // SWAP: Render both listings side by side
  if (interactionIntent === "swap" && viewerListing && otherListing) {
    return (
      <div className="space-y-4">
        {/* Header with badges */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Swap Details</h3>
          <div className="flex items-center gap-1.5">
            <Badge className={badgeVariants.swap.primary}>{intentLabels.swap}</Badge>
            {showFlexibleBadge && (
              <Badge className={badgeVariants.flexible.primary}>
                {intentLabels.flexible}
              </Badge>
            )}
          </div>
        </div>

        {/* Two listing cards */}
        <div className="relative grid md:grid-cols-2 gap-4">
          {/* Viewer's listing */}
          <Card className="border-2 border-cyan-200 bg-cyan-50/30">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-600" />
                <CardTitle className="text-sm font-semibold text-cyan-900">You</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-base font-bold">
                Sec {viewerListing.haveSection} • Row {viewerListing.haveRow} • Seat{" "}
                {viewerListing.haveSeat}
              </div>
              <Badge variant="secondary" className="text-xs">
                {viewerListing.haveZone}
              </Badge>
              {viewerListing.wantZones && viewerListing.wantZones.length > 0 && (
                <div className="text-xs text-muted-foreground pt-1">
                  <span className="font-medium">Looking for: </span>
                  {viewerListing.wantZones.join(", ")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Swap arrows (decorative) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-white rounded-full p-2 shadow-md border-2 border-violet-200">
              <ArrowLeftRight className="h-5 w-5 text-violet-600" aria-hidden="true" />
            </div>
          </div>

          {/* Other user's listing */}
          <Card className="border-2 border-slate-200 bg-slate-50/30">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-600" />
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Them
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-base font-bold">
                Sec {otherListing.haveSection} • Row {otherListing.haveRow} • Seat{" "}
                {otherListing.haveSeat}
              </div>
              <Badge variant="secondary" className="text-xs">
                {otherListing.haveZone}
              </Badge>
              {otherListing.wantZones && otherListing.wantZones.length > 0 && (
                <div className="text-xs text-muted-foreground pt-1">
                  <span className="font-medium">Looking for: </span>
                  {otherListing.wantZones.join(", ")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Game date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {gameDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </span>
        </div>
      </div>
    )
  }

  // FOR_SALE: Show other person's listing (they're selling)
  if (interactionIntent === "forSale" && otherListing) {
    return (
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <CardTitle className="text-base text-muted-foreground">Their Seat</CardTitle>
            <div className="flex items-center gap-1.5">
              <Badge className={badgeVariants.forSale.primary}>
                {intentLabels.forSale}
              </Badge>
              {showFlexibleBadge && (
                <Badge className={badgeVariants.flexible.primary}>
                  {intentLabels.flexible}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-2xl font-bold mb-1">
              Section {otherListing.haveSection} • Row {otherListing.haveRow} • Seat{" "}
              {otherListing.haveSeat}
            </div>
            <Badge variant="secondary" className="text-sm">
              {otherListing.haveZone}
            </Badge>
          </div>

          {/* Game Info */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Game Date</div>
              <div className="text-muted-foreground">
                {gameDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              You&apos;re responding to their listing.
            </p>
            {viewerListing?.wantZones && viewerListing.wantZones.length > 0 && (
              <p className="text-xs text-slate-600 mt-1">
                You&apos;re looking for: {viewerListing.wantZones.join(", ")}
              </p>
            )}
          </div>
          {viewerListing && (
            <div className="pt-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">You</div>
              <div className="text-sm">
                Sec {viewerListing.haveSection} • Row {viewerListing.haveRow} • Seat{" "}
                {viewerListing.haveSeat}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // LOOKING_FOR: Show other person's request (they're looking)
  if (interactionIntent === "lookingFor" && otherListing) {
    return (
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <CardTitle className="text-base text-muted-foreground">
              Their Request
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Badge className={badgeVariants.lookingFor.primary}>
                {intentLabels.lookingFor}
              </Badge>
              {showFlexibleBadge && (
                <Badge className={badgeVariants.flexible.primary}>
                  {intentLabels.flexible}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-lg font-semibold mb-2">
              This person is looking for tickets
            </div>
            {otherListing.wantZones && otherListing.wantZones.length > 0 && (
              <div className="mb-2">
                <span className="text-sm text-muted-foreground">Preferred Zones: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {otherListing.wantZones.map((zone, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {zone}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {otherListing.wantSections && otherListing.wantSections.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">
                  Preferred Sections:{" "}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {otherListing.wantSections.map((section, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {(!otherListing.wantZones || otherListing.wantZones.length === 0) &&
              (!otherListing.wantSections || otherListing.wantSections.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  Open to any section or zone
                </p>
              )}
          </div>

          {/* Game Info */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Game Date</div>
              <div className="text-muted-foreground">
                {gameDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">You&apos;re offering seats.</p>
            {viewerListing && (
              <p className="text-xs text-slate-600 mt-1">
                You&apos;re offering: Sec {viewerListing.haveSection}, Row{" "}
                {viewerListing.haveRow}
              </p>
            )}
          </div>
          {viewerListing && (
            <div className="pt-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">You</div>
              <div className="text-sm">
                Sec {viewerListing.haveSection} • Row {viewerListing.haveRow} • Seat{" "}
                {viewerListing.haveSeat}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Fallback: Show generic listing (when we can't determine intent or missing data)
  const isHaveListing = listing.listingType === "HAVE"

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-muted-foreground">
          {isHaveListing ? "Seat Details" : "Looking For"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Seat Info */}
        {isHaveListing ? (
          <div>
            <div className="text-2xl font-bold mb-1">
              Section {listing.haveSection} • Row {listing.haveRow} • Seat{" "}
              {listing.haveSeat}
            </div>
            <Badge variant="secondary" className="text-sm">
              {listing.haveZone}
            </Badge>
          </div>
        ) : (
          <div>
            <div className="text-lg font-semibold mb-2">
              This person is looking for tickets
            </div>
            {listing.wantZones.length > 0 && (
              <div className="mb-2">
                <span className="text-sm text-muted-foreground">Preferred Zones: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {listing.wantZones.map((zone, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {zone}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {listing.wantSections.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">
                  Preferred Sections:{" "}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {listing.wantSections.map((section, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {listing.wantZones.length === 0 && listing.wantSections.length === 0 && (
              <p className="text-sm text-muted-foreground">Open to any section or zone</p>
            )}
          </div>
        )}

        {/* Game Info */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">Game Date</div>
            <div className="text-muted-foreground">
              {gameDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {isHaveListing
              ? "You're discussing this seat"
              : "You're discussing this ticket request"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
