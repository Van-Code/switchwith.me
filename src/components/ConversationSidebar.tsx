"use client"

import { ConversationListingHeader } from "./ConversationListingHeader"
import { RelatedListings } from "./RelatedListings"
import { SwapParticipantsStrip } from "./SwapParticipantsStrip"
import { isRelatedListingsEnabled } from "@/lib/features"

interface Listing {
  listingType: string
  haveSection: string
  haveRow: string
  haveSeat: string
  haveZone: string
  wantZones: string[]
  wantSections: string[]
  gameDate: Date | string
  gameId?: string | null
}

interface Participant {
  userId: string
  user: {
    id: string
    profile: {
      firstName: string
      lastInitial: string | null
      avatarUrl?: string | null
    } | null
  }
}

interface ConversationSidebarProps {
  listing: Listing | null
  listingId: string | null
  currentUserId: string
  participants?: Participant[]
}

export function ConversationSidebar({
  listing,
  listingId,
  currentUserId,
  participants,
}: ConversationSidebarProps) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      {/* Current Listing */}
      <ConversationListingHeader
        listing={listing}
        participants={participants}
        currentUserId={currentUserId}
      />

      {/* People in this swap */}
      {participants && participants.length > 0 && (
        <SwapParticipantsStrip participants={participants} />
      )}

      {/* Related Listings - only show if there's a listing */}
      {listingId && isRelatedListingsEnabled() && (
        <div className="hidden lg:block">
          <RelatedListings listingId={listingId} currentUserId={currentUserId} />
        </div>
      )}
    </aside>
  )
}
