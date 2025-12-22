/**
 * Utility to explicitly identify viewer's and other participant's listings
 * Eliminates ambiguity in conversation header rendering
 */

export interface ListingForConversation {
  id: string
  listingType?: "HAVE" | "WANT"
  haveSection: string
  haveRow: string
  haveSeat: string
  haveZone: string
  wantZones?: string[]
  wantSections?: string[]
  flexible?: boolean
  teamId?: number
  gameDate: string | Date
}

export interface ParticipantWithListings {
  userId: string
  user: {
    id: string
    profile: {
      firstName: string
      lastInitial: string | null
    } | null
    listings?: ListingForConversation[]
  }
}

export interface ViewerAndOtherListings {
  viewerListing: ListingForConversation | null
  otherListing: ListingForConversation | null
}

/**
 * Gets viewer and other participant's listings for a specific game/team
 *
 * @param participants - Array of conversation participants with their listings
 * @param currentUserId - ID of the current viewer
 * @param conversationTeamId - Team ID to match
 * @param conversationGameDate - Game date to match
 * @returns Object with viewerListing and otherListing, or nulls if not found
 */
export function getViewerAndOtherListing({
  participants,
  currentUserId,
  conversationTeamId,
  conversationGameDate,
}: {
  participants: ParticipantWithListings[]
  currentUserId: string
  conversationTeamId?: number
  conversationGameDate?: string | Date
}): ViewerAndOtherListings {
  // Find participants explicitly by user ID
  const viewerParticipant = participants.find((p) => p.user.id === currentUserId)
  const otherParticipant = participants.find((p) => p.user.id !== currentUserId)

  // Find viewer's listing for this game/team
  const viewerListing =
    viewerParticipant?.user.listings?.find(
      (l) =>
        l.teamId === conversationTeamId &&
        new Date(l.gameDate).toDateString() ===
          new Date(conversationGameDate || "").toDateString()
    ) || null

  // Find other participant's listing for this game/team
  const otherListing =
    otherParticipant?.user.listings?.find(
      (l) =>
        l.teamId === conversationTeamId &&
        new Date(l.gameDate).toDateString() ===
          new Date(conversationGameDate || "").toDateString()
    ) || null

  return { viewerListing, otherListing }
}
