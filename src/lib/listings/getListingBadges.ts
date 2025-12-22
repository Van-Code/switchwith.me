/**
 * Determines the primary and secondary badges for a listing based on its properties
 */

export type PrimaryBadge = "Swap" | "For Sale" | "Looking For"
export type SecondaryBadge = "Flexible" | null

export interface ListingBadges {
  primary: PrimaryBadge
  secondary: SecondaryBadge
}

interface BadgeInput {
  listingType?: string
  haveSection?: string
  haveRow?: string
  haveSeat?: string
  wantZones?: string[]
  wantSections?: string[]
  priceCents?: number | null
  flexible?: boolean
}

/**
 * Derives badge labels from listing data
 *
 * Rules:
 * - hasTickets: listing has concrete seat data (section/row/seat) or listingType is HAVE
 * - hasWants: listing has wants (wantZones or wantSections non-empty) or listingType is WANT
 * - forSale: hasTickets and (price > 0 OR only has tickets, no wants)
 * - flexible: explicitly set via flexible field, or wantZones is empty/includes "Any"
 *
 * Mapping:
 * - If hasTickets and hasWants => primary = Swap
 * - Else if hasTickets => primary = For Sale
 * - Else => primary = Looking For
 *
 * Secondary:
 * - If flexible => secondary = Flexible
 */
export function getListingBadges(listing: BadgeInput): ListingBadges {
  // Determine hasTickets
  const hasTickets =
    listing.listingType === "HAVE" ||
    (listing.haveSection && listing.haveRow && listing.haveSeat)

  // Determine hasWants
  const hasWants =
    listing.listingType === "WANT" ||
    (listing.wantZones && listing.wantZones.length > 0) ||
    (listing.wantSections && listing.wantSections.length > 0)

  // Determine primary badge
  let primary: PrimaryBadge
  if (hasTickets && hasWants) {
    primary = "Swap"
  } else if (hasTickets) {
    primary = "For Sale"
  } else {
    primary = "Looking For"
  }

  // Determine flexible (secondary badge)
  const wantZonesIncludesAny =
    listing.wantZones &&
    listing.wantZones.some((zone) => zone.toLowerCase().includes("any"))

  const isFlexible = listing.flexible || wantZonesIncludesAny || false

  const secondary: SecondaryBadge = isFlexible ? "Flexible" : null

  return { primary, secondary }
}
