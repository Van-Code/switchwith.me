import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { findMatches } from "@/lib/matching"
import { createMatchNotification } from "@/lib/notifications"
import { inferZoneFromSection } from "@/lib/zone-mapping"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = "force-dynamic";

// GET /api/listings - Browse/filter listings
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // Get all filter parameters
    const search = (searchParams.get("search") ?? "").trim()
    const sort = searchParams.get("sort") ?? "createdDesc"
    const section = (searchParams.get("section") ?? "").trim()
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const teamFilter = searchParams.get("team") // comma-separated team slugs

    const where: any = {
      status: "ACTIVE"
    }

    // Text search across multiple fields
    if (search) {
      where.OR = [
        { haveSection: { contains: search, mode: "insensitive" } },
        { haveRow: { contains: search, mode: "insensitive" } },
        { haveSeat: { contains: search, mode: "insensitive" } },
        { haveZone: { contains: search, mode: "insensitive" } }
      ]
    }

    // Section filter
    if (section) {
      where.haveSection = { contains: section, mode: "insensitive" }
    }

    // Listing type filter
    const listingType = searchParams.get("listingType")
    if (listingType && (listingType === "HAVE" || listingType === "WANT")) {
      where.listingType = listingType
    }

    // Date range filter
    if (from || to) {
      where.gameDate = {}
      if (from) {
        // Parse date string to avoid timezone issues
        // Date input provides YYYY-MM-DD, parse it as local time
        const [year, month, day] = from.split('-').map(Number);
        const fromDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        if (!isNaN(fromDate.getTime())) {
          where.gameDate.gte = fromDate;
        }
      }
      if (to) {
        // Parse date string to avoid timezone issues
        const [year, month, day] = to.split('-').map(Number);
        const toDate = new Date(year, month - 1, day, 23, 59, 59, 999);
        if (!isNaN(toDate.getTime())) {
          where.gameDate.lte = toDate;
        }
      }
    }

    // Team filter
    const teams = await prisma.team.findMany({})
    if (teamFilter) {
      const teamSlugs = teamFilter
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      if (teamSlugs.length > 0) {
        where.team = {
          slug: {
            in: teamSlugs
          }
        }
      }
    }

        // Build orderBy based on sort param
        // Boosted listings always appear first, then apply secondary sort
        let orderBy: any[] = [
            { boosted: "desc" }, // Boosted listings first
        ]

        switch (sort) {
            case "createdAsc":
                orderBy.push({ boostedAt: "desc" }, { createdAt: "asc" })
                break
            case "createdDesc":
                orderBy.push({ boostedAt: "desc" }, { createdAt: "desc" })
                break
            case "sectionAsc":
                orderBy.push({ boostedAt: "desc" }, { haveSection: "asc" })
                break
            case "gameSoonest":
                orderBy.push({ boostedAt: "desc" }, { gameDate: "asc" })
                break
            case "gameFarthest":
                orderBy.push({ boostedAt: "desc" }, { gameDate: "desc" })
                break
            default:
                orderBy.push({ boostedAt: "desc" }, { createdAt: "desc" })
        }

    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastInitial: true,
                emailVerified: true
              }
            }
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            primaryColor: true,
            secondaryColor: true
          }
        }
      }
    })

        // Serialize dates to strings
        const serializedListings = listings.map((listing: any) => ({
            ...listing,
            gameDate: listing.gameDate.toISOString(),
            createdAt: listing.createdAt.toISOString(),
            updatedAt: listing.updatedAt.toISOString(),
            boostedAt: listing.boostedAt ? listing.boostedAt.toISOString() : null,
            user: listing.user
                ? {
                      ...listing.user,
                  }
                : undefined,
        }))

    return NextResponse.json({ listings: serializedListings })
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

// POST /api/listings - Create a new listing
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      teamId,
      gameId,
      gameDate,
      listingType,
      haveSection,
      haveRow,
      haveSeat,
      wantZones,
      wantSections,
      willingToAddCash
    } = body

    // Validate required fields
    if (!teamId || !gameDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // For HAVE listings, seat details are required (zone will be inferred)
    if (listingType === "HAVE" && (!haveSection || !haveRow || !haveSeat)) {
      return NextResponse.json({ error: "Seat details required for HAVE listings" }, { status: 400 })
    }

    // Infer zone from section for HAVE listings
    const haveZone = listingType === "HAVE" ? inferZoneFromSection(haveSection) : ""

    // Validate that team exists
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) }
    })

    if (!team) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 })
    }

    // Parse gameDate as YYYY-MM-DD and create Date at noon UTC to avoid timezone shifts
    const parsedGameDate = new Date(`${gameDate}T12:00:00.000Z`)

    const listing = await prisma.listing.create({
      data: {
        userId: session.user.id,
        teamId: parseInt(teamId),
        gameId,
        gameDate: parsedGameDate,
        listingType: listingType || "HAVE",
        haveSection: haveSection || "",
        haveRow: haveRow || "",
        haveSeat: haveSeat || "",
        haveZone: haveZone || "",
        wantZones: wantZones || [],
        wantSections: wantSections || [],
        willingToAddCash: willingToAddCash || false
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            primaryColor: true,
            secondaryColor: true
          }
        }
      }
    });

    // Find matches for the new listing and notify users
    // Run asynchronously to not block the response
    (async () => {
      try {
        // Get all active listings for matching (same team only)
        const allListings = await prisma.listing.findMany({
          where: {
            status: "ACTIVE",
            teamId: parseInt(teamId)
          },
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        })

        // Find matches for the new listing
        const matches = findMatches(listing, allListings)

        // Notify the new listing owner about matches
        for (const match of matches.slice(0, 3)) {
          // Notify about top 3 matches
          const matchedListing = allListings.find((l) => l.id === match.listingId)
          if (matchedListing) {
            const matchedUserName = matchedListing.user.profile
              ? `${matchedListing.user.profile.firstName} ${matchedListing.user.profile.lastInitial}.`
              : "Someone"

            await createMatchNotification({
              userId: session.user.id,
              listingId: listing.id,
              matchedListingId: matchedListing.id,
              matchScore: match.score,
              description: `Great news! ${matchedUserName} has a seat that matches your listing. ${match.reason}`
            }).catch((error) => {
              console.error("Failed to create match notification:", error)
            })
          }
        }

        // Notify existing listing owners about the new match
        for (const match of matches.slice(0, 3)) {
          // Notify top 3 matched users
          const matchedListing = allListings.find((l) => l.id === match.listingId)
          if (matchedListing && matchedListing.userId !== session.user.id) {
            const newListingUserName = listing.user.profile
              ? `${listing.user.profile.firstName} ${listing.user.profile.lastInitial}.`
              : "Someone"

            await createMatchNotification({
              userId: matchedListing.userId,
              listingId: matchedListing.id,
              matchedListingId: listing.id,
              matchScore: match.score,
              description: `Great news! ${newListingUserName} just listed a seat that matches what you're looking for. ${match.reason}`
            }).catch((error) => {
              console.error("Failed to create match notification:", error)
            })
          }
        }
      } catch (error) {
        console.error("Failed to find matches and send notifications:", error)
      }
    })()

    return NextResponse.json({ listing })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
