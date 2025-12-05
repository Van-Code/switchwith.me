import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET /api/listings/[id]/related - Get related listings
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id

    // Fetch the original listing
    const originalListing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        team: true,
      },
    })

    if (!originalListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    // Calculate date range (2 weeks before and after)
    const gameDate = new Date(originalListing.gameDate)
    const twoWeeksBefore = new Date(gameDate)
    twoWeeksBefore.setDate(gameDate.getDate() - 14)
    const twoWeeksAfter = new Date(gameDate)
    twoWeeksAfter.setDate(gameDate.getDate() + 14)

    // Build the query for related listings
    const relatedListings = await prisma.listing.findMany({
      where: {
        AND: [
          { id: { not: listingId } }, // Exclude the current listing
          { status: "ACTIVE" }, // Only active listings
          { teamId: originalListing.teamId }, // Same team
          {
            gameDate: {
              gte: twoWeeksBefore,
              lte: twoWeeksAfter,
            },
          },
        ],
      },
      include: {
        team: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: [
        { boosted: "desc" }, // Boosted listings first
        { createdAt: "desc" }, // Then by newest
      ],
      take: 6, // Limit to 6 related listings
    })

    // Score and sort by relevance
    const scoredListings = relatedListings.map((listing) => {
      let score = 0

      // Same zone (+3 points)
      if (listing.haveZone === originalListing.haveZone) {
        score += 3
      }

      // Same section (+5 points)
      if (listing.haveSection === originalListing.haveSection) {
        score += 5
      }

      // Wants include the original listing's zone (+2 points)
      if (listing.wantZones.includes(originalListing.haveZone)) {
        score += 2
      }

      // Wants include the original listing's section (+3 points)
      if (listing.wantSections.includes(originalListing.haveSection)) {
        score += 3
      }

      // Close game date (+1 point per day closer, max 7 points)
      const daysDiff = Math.abs(
        Math.floor(
          (new Date(listing.gameDate).getTime() - gameDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
      score += Math.max(0, 7 - daysDiff)

      // Similar face value (+1-3 points based on closeness)
      const priceDiff = Math.abs(listing.faceValue - originalListing.faceValue)
      if (priceDiff < 10) score += 3
      else if (priceDiff < 25) score += 2
      else if (priceDiff < 50) score += 1

      return {
        ...listing,
        relevanceScore: score,
      }
    })

    // Sort by relevance score (highest first)
    scoredListings.sort((a, b) => b.relevanceScore - a.relevanceScore)

    return NextResponse.json({
      listings: scoredListings.slice(0, 6).map(({ relevanceScore, ...listing }) => listing)
    })
  } catch (error) {
    console.error("Error fetching related listings:", error)
    return NextResponse.json(
      { error: "Failed to fetch related listings" },
      { status: 500 }
    )
  }
}
