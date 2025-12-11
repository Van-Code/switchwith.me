export type Listing = {
  id: string
  gameDate: Date
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
 * A match occurs when:
 * - Listing A's HAVE matches Listing B's WANT
 * - Listing B's HAVE matches Listing A's WANT
 */
export function findMatches(myListing: Listing, allListings: Listing[]): MatchScore[] {
  const matches: MatchScore[] = []

  for (const otherListing of allListings) {
    // Skip own listings
    if (otherListing.id === myListing.id) continue

    // Skip listings for different games
    if (myListing.gameDate.getTime() !== otherListing.gameDate.getTime()) continue

    // Skip non-active listings
    if (otherListing.status !== "ACTIVE") continue

    // Check if there's a mutual match
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

    if (myHaveMatchesTheirWant && theirHaveMatchesMyWant) {
      const score = calculateScore(myListing, otherListing)
      const reason = generateReason(myListing, otherListing)

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

  // Exact section match is best
  if (
    listing1.haveSection === listing2.wantSections[0] &&
    listing2.haveSection === listing1.wantSections[0]
  ) {
    score += 50
  }

  // Same zone is good
  if (
    listing1.wantZones.includes(listing2.haveZone) &&
    listing2.wantZones.includes(listing1.haveZone)
  ) {
    score += 25
  }

  return score
}

/**
 * Generate a human-readable reason for the match
 */
function generateReason(listing1: Listing, listing2: Listing): string {
  const reasons: string[] = []

  if (listing1.haveSection === listing2.wantSections[0]) {
    reasons.push("Exact section match")
  }

  if (listing1.wantZones.includes(listing2.haveZone)) {
    reasons.push(`Your want matches their ${listing2.haveZone}`)
  }

  return reasons.length > 0 ? reasons.join(" • ") : "Compatible swap"
}
