export type Listing = {
  id: string
  gameDate: Date
  listingType?: string
  haveZone: string
  wantZones: string[]
  haveSection: string
  wantSections: string[]
  status: string
}
export interface MatchScore {
  listingId: string
  score: number
  reason: string
}

export interface ListingWithUser extends Listing {
  user: {
    id: string
    profile: {
      firstName: string
      lastInitial: string | null
      successfulSwapsCount: number
    } | null
  }
}

/**
 * Find potential matches for a given listing
 * For HAVE listings:
 * - Match occurs when my HAVE matches their WANT and their HAVE matches my WANT (mutual swap)
 * For WANT listings:
 * - Match occurs when their HAVE matches my WANT (I'm looking for what they have)
 */
export function findMatches(myListing: Listing, allListings: Listing[]): MatchScore[] {
  const matches: MatchScore[] = []
  const myListingType = myListing.listingType || "HAVE"

  for (const otherListing of allListings) {
    // Skip own listings
    if (otherListing.id === myListing.id) continue

    // Skip listings for different games
    if (myListing.gameDate.getTime() !== otherListing.gameDate.getTime()) continue

    // Skip non-active listings
    if (otherListing.status !== "ACTIVE") continue

    const otherListingType = otherListing.listingType || "HAVE"
    let isMatch = false

    if (myListingType === "HAVE" && otherListingType === "HAVE") {
      // Traditional mutual swap: both have tickets to trade
      const myHaveMatchesTheirWant = checkMatch(
        myListing.haveZone,
        myListing.haveSection,
        otherListing.wantZones,
        otherListing.wantSections
      )

      const theirHaveMatchesMyWant = checkMatch(
        otherListing.haveZone,
        otherListing.haveSection,
        myListing.wantZones,
        myListing.wantSections
      )

      isMatch = myHaveMatchesTheirWant && theirHaveMatchesMyWant
    } else if (myListingType === "WANT" && otherListingType === "HAVE") {
      // I want tickets, they have tickets
      // Check if what they have matches what I want
      isMatch = checkMatch(
        otherListing.haveZone,
        otherListing.haveSection,
        myListing.wantZones,
        myListing.wantSections
      )
    } else if (myListingType === "HAVE" && otherListingType === "WANT") {
      // I have tickets, they want tickets
      // Check if what I have matches what they want
      isMatch = checkMatch(
        myListing.haveZone,
        myListing.haveSection,
        otherListing.wantZones,
        otherListing.wantSections
      )
    }
    // Skip WANT-to-WANT matches (both looking for tickets)

    if (isMatch) {
      const score = calculateScore(myListing, otherListing)
      const reason = generateReason(myListing, otherListing, myListingType, otherListingType)

      matches.push({
        listingId: otherListing.id,
        score,
        reason,
      })
    }
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score)
}

/**
 * Check if a HAVE (zone/section) matches a WANT (list of acceptable zones/sections)
 */
function checkMatch(
  haveZone: string,
  haveSection: string,
  wantZones: string[],
  wantSections: string[]
): boolean {
  // If wantZones is empty, accept any zone
  const zoneMatch = wantZones.length === 0 || wantZones.includes(haveZone)

  // If wantSections is empty, accept any section
  const sectionMatch = wantSections.length === 0 || wantSections.includes(haveSection)

  return zoneMatch && sectionMatch
}

/**
 * Calculate a match score based on how well the seats align
 * Higher score = better match
 */
function calculateScore(listing1: Listing, listing2: Listing): number {
  let score = 100 // Base score

  const type1 = listing1.listingType || "HAVE"
  const type2 = listing2.listingType || "HAVE"

  if (type1 === "HAVE" && type2 === "HAVE") {
    // Traditional mutual swap scoring
    if (
      listing1.haveSection === listing2.wantSections[0] &&
      listing2.haveSection === listing1.wantSections[0]
    ) {
      score += 50
    }

    if (
      listing1.wantZones.includes(listing2.haveZone) &&
      listing2.wantZones.includes(listing1.haveZone)
    ) {
      score += 25
    }
  } else {
    // HAVE/WANT or WANT/HAVE matching
    const haveListing = type1 === "HAVE" ? listing1 : listing2
    const wantListing = type1 === "WANT" ? listing1 : listing2

    // Exact section match for what they want
    if (wantListing.wantSections.includes(haveListing.haveSection)) {
      score += 50
    }

    // Zone match
    if (wantListing.wantZones.includes(haveListing.haveZone)) {
      score += 25
    }
  }

  return score
}

/**
 * Generate a human-readable reason for the match
 */
function generateReason(listing1: Listing, listing2: Listing, type1: string, type2: string): string {
  const reasons: string[] = []

  if (type1 === "HAVE" && type2 === "HAVE") {
    // Traditional swap
    if (listing1.haveSection === listing2.wantSections[0]) {
      reasons.push("Exact section match")
    }

    if (listing1.wantZones.includes(listing2.haveZone)) {
      reasons.push(`Your want matches their ${listing2.haveZone}`)
    }
  } else if (type1 === "WANT" && type2 === "HAVE") {
    // I want, they have
    if (listing1.wantSections.includes(listing2.haveSection)) {
      reasons.push(`They have Section ${listing2.haveSection} that you want`)
    } else if (listing1.wantZones.includes(listing2.haveZone)) {
      reasons.push(`They have ${listing2.haveZone} tickets`)
    }
  } else if (type1 === "HAVE" && type2 === "WANT") {
    // I have, they want
    if (listing2.wantSections.includes(listing1.haveSection)) {
      reasons.push(`They want Section ${listing1.haveSection} that you have`)
    } else if (listing2.wantZones.includes(listing1.haveZone)) {
      reasons.push(`They want ${listing1.haveZone} tickets`)
    }
  }

  return reasons.length > 0 ? reasons.join(" • ") : "Compatible match"
}
