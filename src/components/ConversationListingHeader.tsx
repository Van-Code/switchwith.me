import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"
import { getInteractionIntent } from "@/lib/listings/getInteractionIntent"
import { getListingBadges } from "@/lib/listings/getListingBadges"

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
  } | null
  participants?: Array<{
    userId: string
    user: {
      id: string
      profile: {
        firstName: string
        lastInitial: string | null
      } | null
      listings?: Array<{
        id: string
        listingType?: "HAVE" | "WANT"
        haveSection: string
        haveRow: string
        haveSeat: string
        haveZone: string
        wantZones?: string[]
        wantSections?: string[]
        flexible?: boolean
        teamId: number
        gameDate: string
      }>
    }
  }>
  currentUserId?: string
}

export function ConversationListingHeader({ listing, participants, currentUserId }: ConversationListingHeaderProps) {
  if (!listing) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center italic">
            No listing attached to this conversation
          </p>
        </CardContent>
      </Card>
    )
  }

  const gameDate = new Date(listing.gameDate)
  const isHaveListing = listing.listingType === "HAVE"

  // Calculate interaction intent if we have both participants and listings
  let interactionIntent: "swap" | "forSale" | "lookingFor" | null = null
  let showFlexibleBadge = false

  if (participants && currentUserId) {
    const currentUserParticipant = participants.find((p) => p.user.id === currentUserId)
    const otherParticipant = participants.find((p) => p.user.id !== currentUserId)

    const conversationTeamId = listing.teamId
    const conversationGameDate = listing.gameDate

    // Find the viewer's listing for this game/team
    const viewerListing = currentUserParticipant?.user.listings?.find(
      (l) =>
        l.teamId === conversationTeamId &&
        new Date(l.gameDate).toDateString() ===
          new Date(conversationGameDate || "").toDateString()
    )

    // Find the other user's listing for this game/team
    const otherListing = otherParticipant?.user.listings?.find(
      (l) =>
        l.teamId === conversationTeamId &&
        new Date(l.gameDate).toDateString() ===
          new Date(conversationGameDate || "").toDateString()
    )

    // Calculate interaction intent if we have both listings
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
      interactionIntent = badges.primary === "Swap" ? "swap" : badges.primary === "For Sale" ? "forSale" : "lookingFor"
      showFlexibleBadge = badges.secondary === "Flexible"
    }
  }

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <CardTitle className="text-base text-muted-foreground">
            {isHaveListing ? "Seat Details" : "Looking For"}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {interactionIntent && (
              <Badge className={badgeVariants[interactionIntent].primary}>
                {intentLabels[interactionIntent]}
              </Badge>
            )}
            {showFlexibleBadge && (
              <Badge className={badgeVariants.flexible.primary}>
                {intentLabels.flexible}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Seat Info */}
        {isHaveListing ? (
          <div>
            <div className="text-2xl font-bold mb-1">
              Section {listing.haveSection} • Row {listing.haveRow} • Seat {listing.haveSeat}
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
                <span className="text-sm text-muted-foreground">Preferred Sections: </span>
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
              <p className="text-sm text-muted-foreground">
                Open to any section or zone
              </p>
            )}
          </div>
        )}

        {/* Game Info */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">Game Date</div>
            <div className="text-muted-foreground">
              {gameDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC'
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {isHaveListing ? "You're discussing this seat swap" : "You're discussing this ticket request"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
