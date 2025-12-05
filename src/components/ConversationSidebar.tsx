"use client"

import { ConversationListingHeader } from "./ConversationListingHeader"
import { RelatedListings } from "./RelatedListings"
import { isRelatedListingsEnabled } from "@/lib/features"

interface Listing {
  haveSection: string
  haveRow: string
  haveSeat: string
  haveZone: string
  gameDate: Date | string
  faceValue: number
  gameId?: string | null
}

interface ConversationSidebarProps {
  listing: Listing | null
  listingId: string | null
  currentUserId: string
}

export function ConversationSidebar({
  listing,
  listingId,
  currentUserId,
}: ConversationSidebarProps) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      {/* Current Listing */}
      <ConversationListingHeader listing={listing} />

      {/* Related Listings - only show if there's a listing */}
      {listingId && isRelatedListingsEnabled() && (
        <div className="hidden lg:block">
          <RelatedListings listingId={listingId} currentUserId={currentUserId} />
        </div>
      )}
    </aside>
  )
}
