/**
 * Determines the interaction intent between two listings
 * Returns the type of transaction from the viewer's perspective
 */

export type InteractionIntent = "swap" | "forSale" | "lookingFor"

export interface ListingForInteraction {
  listingType?: "HAVE" | "WANT"
  haveSection?: string
  haveRow?: string
  haveSeat?: string
  haveZone?: string
  wantZones?: string[]
  wantSections?: string[]
}

/**
 * Single source of truth for determining interaction intent
 *
 * Selection rules (in order):
 * 1. Both have tickets AND both have wants → swap
 * 2. Viewer has tickets AND other looking for → forSale
 * 3. Viewer looking for AND other has tickets → lookingFor
 * 4. Fallback based on viewer listing
 */
export function getInteractionIntent({
  viewerListing,
  otherListing,
}: {
  viewerListing: ListingForInteraction
  otherListing: ListingForInteraction
}): InteractionIntent {
  // Determine if viewer has tickets
  const viewerHasTickets =
    viewerListing.listingType === "HAVE" ||
    (!!viewerListing.haveSection && !!viewerListing.haveRow && !!viewerListing.haveSeat)

  // Determine if viewer has wants
  const viewerHasWants =
    viewerListing.listingType === "WANT" ||
    (viewerListing.wantZones && viewerListing.wantZones.length > 0) ||
    (viewerListing.wantSections && viewerListing.wantSections.length > 0)

  // Determine if other has tickets
  const otherHasTickets =
    otherListing.listingType === "HAVE" ||
    (!!otherListing.haveSection && !!otherListing.haveRow && !!otherListing.haveSeat)

  // Determine if other has wants
  const otherHasWants =
    otherListing.listingType === "WANT" ||
    (otherListing.wantZones && otherListing.wantZones.length > 0) ||
    (otherListing.wantSections && otherListing.wantSections.length > 0)

  // Rule 1: Both have tickets AND both have wants → swap
  if (viewerHasTickets && viewerHasWants && otherHasTickets && otherHasWants) {
    return "swap"
  }

  // Rule 2: Viewer has tickets AND other looking for → forSale
  if (viewerHasTickets && otherHasWants && !viewerHasWants) {
    return "forSale"
  }

  // Rule 3: Viewer looking for AND other has tickets → lookingFor
  if (viewerHasWants && !viewerHasTickets && otherHasTickets && !otherHasWants) {
    return "lookingFor"
  }

  // Rule 4: Fallback based on viewer listing
  if (viewerHasTickets && viewerHasWants) {
    return "swap"
  }
  if (viewerHasTickets) {
    return "forSale"
  }
  return "lookingFor"
}
