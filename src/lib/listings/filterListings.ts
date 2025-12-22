import { getListingBadges, PrimaryBadge } from "./getListingBadges"

export type TabValue = "all" | "for-sale" | "looking-for" | "swap"

interface ListingForFiltering {
  listingType?: string
  haveSection?: string
  haveRow?: string
  haveSeat?: string
  wantZones?: string[]
  wantSections?: string[]
  priceCents?: number | null
  flexible?: boolean
  seatCount?: number | null
}

/**
 * Filters listings based on the active tab
 * @param listings - Array of listings to filter
 * @param activeTab - The currently active tab
 * @returns Filtered array of listings
 */
export function filterListingsByTab<T extends ListingForFiltering>(
  listings: T[],
  activeTab: TabValue
): T[] {
  if (activeTab === "all") {
    return listings
  }

  const tabToBadgeMap: Record<Exclude<TabValue, "all">, PrimaryBadge> = {
    "for-sale": "For Sale",
    "looking-for": "Looking For",
    swap: "Swap",
  }

  const targetBadge = tabToBadgeMap[activeTab]

  return listings.filter((listing) => {
    const badges = getListingBadges(listing)
    return badges.primary === targetBadge
  })
}

/**
 * Filters listings based on seat count needed
 * @param listings - Array of listings to filter
 * @param seatsNeeded - Number of seats needed, or "any"
 * @returns Filtered array of listings
 */
export function filterListingsBySeatCount<T extends ListingForFiltering>(
  listings: T[],
  seatsNeeded: number | "any"
): T[] {
  if (seatsNeeded === "any") {
    return listings
  }

  return listings.filter((listing) => {
    const badges = getListingBadges(listing)

    // For LOOKING_FOR listings: match if requestedSeatCount equals filter value
    if (badges.primary === "Looking For") {
      return listing.seatCount === seatsNeeded || listing.seatCount == null
    }

    // For FOR_SALE and SWAP listings: match if listing has at least that many seats
    // or if seat count is unknown, only match when filter is "any"
    if (listing.seatCount != null) {
      return listing.seatCount >= seatsNeeded
    }

    // If seatCount is not set, we don't filter it out for FOR_SALE/SWAP
    return true
  })
}
