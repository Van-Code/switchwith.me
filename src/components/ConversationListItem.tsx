import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import Link from "next/link"
import { Calendar, MapPin, XCircle } from "lucide-react"
import { getInteractionIntent } from "@/lib/listings/getInteractionIntent"

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

interface ConversationListItemProps {
  conversation: {
    id: string
    updatedAt: Date | string
    status?: "ACTIVE" | "ENDED"
    participants: Array<{
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
    messages: Array<{
      text: string
      createdAt: Date | string
    }>
    listing?: {
      haveSection: string
      haveRow: string
      haveSeat: string
      haveZone: string
      gameDate: Date | string
      teamId?: number
      listingType?: "HAVE" | "WANT"
      wantZones?: string[]
      wantSections?: string[]
      flexible?: boolean
    } | null
  }
  currentUserId: string
}

export function ConversationListItem({
  conversation,
  currentUserId,
}: ConversationListItemProps) {
  const otherParticipant = conversation.participants.find(
    (p: any) => p.user.id !== currentUserId
  )
  const currentUserParticipant = conversation.participants.find(
    (p: any) => p.user.id === currentUserId
  )
  const lastMessage = conversation.messages[0]
  const isEnded = conversation.status === "ENDED"

  // Find the listings for both participants matching this conversation's game
  const conversationListing = conversation.listing
  const conversationTeamId = conversationListing?.teamId
  const conversationGameDate = conversationListing?.gameDate

  // Find the viewer's listing for this game/team
  const viewerListing = currentUserParticipant?.user.listings?.find(
    (l) => l.teamId === conversationTeamId &&
      new Date(l.gameDate).toDateString() === new Date(conversationGameDate || "").toDateString()
  )

  // Find the other user's listing for this game/team
  const otherListing = otherParticipant?.user.listings?.find(
    (l) => l.teamId === conversationTeamId &&
      new Date(l.gameDate).toDateString() === new Date(conversationGameDate || "").toDateString()
  )

  // Calculate interaction intent if we have both listings
  let interactionIntent: "swap" | "forSale" | "lookingFor" | null = null
  if (viewerListing && otherListing) {
    interactionIntent = getInteractionIntent({
      viewerListing,
      otherListing,
    })
  } else if (conversationListing) {
    // Fallback: infer from conversation listing alone
    // If current user owns the listing, it's likely "forSale" or "swap"
    // If other user owns it, current user is likely "lookingFor"
    if (viewerListing) {
      interactionIntent = viewerListing.wantZones && viewerListing.wantZones.length > 0 ? "swap" : "forSale"
    } else if (otherListing) {
      interactionIntent = "lookingFor"
    }
  }

  return (
    <Link href={`/messages/${conversation.id}`}>
      <Card
        className={`transition-all
        bg-white
        hover:shadow-md
        hover:-translate-y-0.5
        hover:bg-white
        cursor-pointer
        rounded-xl ${isEnded ? "opacity-75" : ""}`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {otherParticipant?.user.profile
                    ? `${otherParticipant.user.profile.firstName} ${otherParticipant.user.profile.lastInitial}.`
                    : "Unknown User"}
                </h3>
                {isEnded && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Ended
                  </Badge>
                )}
              </div>
              {lastMessage && (
                <p className="text-sm text-muted-foreground truncate max-w-md mt-1">
                  {lastMessage.text}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground ml-4">
              {new Date(conversation.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Seat Summary */}
          {conversation.listing ? (
            <div className="mt-3 pt-3 border-t space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">
                  Sec {conversation.listing.haveSection} • Row{" "}
                  {conversation.listing.haveRow} • Seat {conversation.listing.haveSeat}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {interactionIntent && (
                  <Badge className={badgeVariants[interactionIntent].subtle}>
                    {intentLabels[interactionIntent]}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(conversation.listing.gameDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground italic">No seat attached</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
