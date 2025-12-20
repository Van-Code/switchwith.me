/**
 * Match transaction type utilities
 * Determines the type of transaction between two listings
 */

export type MatchTransactionType =
  | "SWAP"
  | "SELL"
  | "BUY"
  | "GIVEAWAY"
  | "GENERIC_ASYMMETRIC"

export interface ListingForMatch {
  listingType?: "HAVE" | "WANT"
  haveSection?: string
  haveRow?: string
  haveSeat?: string
  haveZone?: string
  wantZones?: string[]
  wantSections?: string[]
}

/**
 * Determines the transaction type based on viewer's listing and other user's listing
 */
export function getMatchTransactionType({
  viewerListing,
  otherListing,
}: {
  viewerListing: ListingForMatch
  otherListing: ListingForMatch
}): MatchTransactionType {
  const viewerHas = viewerListing.listingType === "HAVE"
  const viewerWants =
    viewerListing.listingType === "WANT" ||
    (viewerListing.wantZones && viewerListing.wantZones.length > 0) ||
    (viewerListing.wantSections && viewerListing.wantSections.length > 0)

  const otherHas = otherListing.listingType === "HAVE"
  const otherWants =
    otherListing.listingType === "WANT" ||
    (otherListing.wantZones && otherListing.wantZones.length > 0) ||
    (otherListing.wantSections && otherListing.wantSections.length > 0)

  // SWAP: Both have tickets and both want something
  if (viewerHas && viewerWants && otherHas && otherWants) {
    return "SWAP"
  }

  // SELL: Viewer has tickets, other wants tickets, viewer wants nothing or is flexible
  if (viewerHas && otherWants && !viewerWants) {
    return "SELL"
  }

  // BUY: Viewer wants tickets, other has tickets, other wants nothing or is flexible
  if (viewerWants && otherHas && !otherWants) {
    return "BUY"
  }

  // GIVEAWAY: Detect if this is a free transfer
  // Note: Currently no explicit price or giveaway field in schema
  // This can be extended when such fields are added
  // For now, we'll rely on the SELL/BUY logic above

  // GENERIC_ASYMMETRIC: Any other asymmetric match
  return "GENERIC_ASYMMETRIC"
}

/**
 * Formats seat information for display, never showing blank placeholders
 */
export function formatSeatLabel(listing: ListingForMatch): string {
  const { haveSection, haveRow, haveSeat, haveZone } = listing

  // If this is a WANT listing without seat details, show flexible message
  if (listing.listingType === "WANT") {
    return "Flexible on exact seat"
  }

  // Build parts array only with non-empty values
  const parts: string[] = []

  if (haveSection && haveSection.trim()) {
    parts.push(`Section ${haveSection}`)
  } else {
    parts.push("Section: Not specified")
  }

  if (haveRow && haveRow.trim()) {
    parts.push(`Row ${haveRow}`)
  }

  if (haveSeat && haveSeat.trim()) {
    parts.push(`Seat ${haveSeat}`)
  }

  // If we only have "Section: Not specified", add zone if available
  if (parts.length === 1 && parts[0] === "Section: Not specified" && haveZone && haveZone.trim()) {
    return `${haveZone} (section not specified)`
  }

  return parts.join(", ")
}

/**
 * Formats want/request information for display
 */
export function formatRequestLabel(listing: ListingForMatch): string {
  const { wantZones, wantSections, listingType } = listing

  // If this is a HAVE listing without wants, they're not looking for anything
  if (listingType === "HAVE" && (!wantZones || wantZones.length === 0) && (!wantSections || wantSections.length === 0)) {
    return "Not requesting a swap"
  }

  const parts: string[] = []

  if (wantZones && wantZones.length > 0) {
    const zoneList = wantZones.join(", ")
    parts.push(zoneList)
  }

  if (wantSections && wantSections.length > 0) {
    const sectionList = wantSections.map((s) => `Sec ${s}`).join(", ")
    parts.push(sectionList)
  }

  if (parts.length === 0) {
    return "Flexible on location"
  }

  return parts.join(" • ")
}

/**
 * Maps match scores to friendly labels
 */
export function getScoreLabel(score: number): string {
  if (score >= 100) {
    return "Strong match"
  }
  if (score >= 50) {
    return "Good match"
  }
  return "Low match"
}

/**
 * Get CTA button text based on transaction type
 */
export function getCtaText(transactionType: MatchTransactionType): string {
  switch (transactionType) {
    case "SWAP":
      return "Start swap chat"
    case "SELL":
      return "Offer your seat"
    case "BUY":
      return "Message seller"
    case "GIVEAWAY":
      return "Message giver"
    case "GENERIC_ASYMMETRIC":
      return "Start conversation"
    default:
      return "Message Owner"
  }
}

/**
 * Get header text based on transaction type
 */
export function getHeaderText(transactionType: MatchTransactionType): string {
  switch (transactionType) {
    case "SWAP":
      return "Swap match"
    case "SELL":
      return "Someone wants your seat"
    case "BUY":
      return "You requested their seat"
    case "GIVEAWAY":
      return "Giveaway match"
    case "GENERIC_ASYMMETRIC":
      return "Potential match"
    default:
      return "Match"
  }
}

/**
 * Get subtext based on transaction type and listings
 */
export function getSubtext(
  transactionType: MatchTransactionType,
  viewerListing: ListingForMatch,
  otherListing: ListingForMatch
): string {
  switch (transactionType) {
    case "SWAP": {
      const viewerWants = formatRequestLabel(viewerListing)
      const otherWants = formatRequestLabel(otherListing)
      return `You want ${viewerWants.toLowerCase()} and they want ${otherWants.toLowerCase()}`
    }
    case "SELL": {
      const theyWant = formatRequestLabel(otherListing)
      const youOffer = viewerListing.haveZone || viewerListing.haveSection || "tickets"
      return `They're looking for ${theyWant.toLowerCase()}. You're offering ${youOffer}.`
    }
    case "BUY": {
      const youWant = formatRequestLabel(viewerListing)
      const theyOffer = otherListing.haveZone || otherListing.haveSection || "tickets"
      return `You're looking for ${youWant.toLowerCase()}. They're offering ${theyOffer}.`
    }
    case "GIVEAWAY":
      return "This seat may be offered for free. Confirm details in chat."
    case "GENERIC_ASYMMETRIC":
      return "Compare the offer and request, then message to confirm details."
    default:
      return ""
  }
}

/**
 * Get helper text for "What this means" section
 */
export function getHelperText(transactionType: MatchTransactionType): string {
  switch (transactionType) {
    case "SWAP":
      return "Use messages to confirm seats, game, and transfer details before exchanging."
    case "SELL":
      return "You're not swapping seats. You're responding to a fan who's looking for one. Use messages to confirm details, pricing, and transfer."
    case "BUY":
      return "This is a request. Use messages to confirm details, pricing, and transfer."
    case "GIVEAWAY":
      return "Confirm transfer method and timing in chat."
    case "GENERIC_ASYMMETRIC":
      return "Review both listings carefully and use messages to discuss the details of this potential match."
    default:
      return "Use messages to confirm details before proceeding."
  }
}

/**
 * Check if user is new (created within last 30 days)
 */
export function isNewMember(createdAt: Date | string): boolean {
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return created > thirtyDaysAgo
}
