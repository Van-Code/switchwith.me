import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/prisma"
import { findMatches } from "../../../lib/matching"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/matches - Get matches for current user's listings
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's active listings
    const myListings = await prisma.listing.findMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    })

    if (myListings.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    // Get all other active listings
    const allListings = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    })

    // Find matches for each of user's listings
    const matchResults = []

    for (const myListing of myListings) {
      const matches = findMatches(myListing, allListings)
      
      for (const match of matches) {
        const matchedListing = allListings.find((l:any) => l.id === match.listingId)
        if (matchedListing) {
          matchResults.push({
            myListing,
            matchedListing,
            score: match.score,
            reason: match.reason,
          })
        }
      }
    }

    // Sort all matches by score
    matchResults.sort((a, b) => b.score - a.score)

    return NextResponse.json({ matches: matchResults })
  } catch (error) {
    console.error("Error fetching matches:", error)
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    )
  }
}