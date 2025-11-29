import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/prisma"
import { findMatches } from "../../../lib/matching"
import { createMatchNotification } from "../../../lib/notifications"

// GET /api/listings - Browse/filter listings
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const gameDate = searchParams.get("gameDate")
        const zone = searchParams.get("zone")
        const section = searchParams.get("section")
        const status = searchParams.get("status") || "ACTIVE"

        const where: any = {
            status: status as any,
        }

        if (gameDate) {
            where.gameDate = new Date(gameDate)
        }

        if (zone) {
            where.haveZone = zone
        }

        if (section) {
            where.haveSection = section
        }

        const listings = await prisma.listing.findMany({
            where,
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json({ listings })
    } catch (error) {
        console.error("Error fetching listings:", error)
        return NextResponse.json(
            { error: "Failed to fetch listings" },
            { status: 500 }
        )
    }
}

// POST /api/listings - Create a new listing
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await req.json()
        const {
            gameId,
            gameDate,
            haveSection,
            haveRow,
            haveSeat,
            haveZone,
            faceValue,
            wantZones,
            wantSections,
            willingToAddCash,
        } = body

        if (!gameDate || !haveSection || !haveRow || !haveSeat || !haveZone || faceValue === undefined) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const listing = await prisma.listing.create({
            data: {
                userId: session.user.id,
                gameId,
                gameDate: new Date(gameDate),
                haveSection,
                haveRow,
                haveSeat,
                haveZone,
                faceValue: parseFloat(faceValue),
                wantZones: wantZones || [],
                wantSections: wantSections || [],
                willingToAddCash: willingToAddCash || false,
            },
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
            },
        })

        // Find matches for the new listing and notify users
        // Run asynchronously to not block the response
        (async () => {
            try {
                // Get all active listings for matching
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

                // Find matches for the new listing
                const matches = findMatches(listing, allListings)

                // Notify the new listing owner about matches
                for (const match of matches.slice(0, 3)) { // Notify about top 3 matches
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
                            description: `Great news! ${matchedUserName} has a seat that matches your listing. ${match.reason}`,
                        }).catch((error) => {
                            console.error("Failed to create match notification:", error)
                        })
                    }
                }

                // Notify existing listing owners about the new match
                for (const match of matches.slice(0, 3)) { // Notify top 3 matched users
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
                            description: `Great news! ${newListingUserName} just listed a seat that matches what you're looking for. ${match.reason}`,
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
        return NextResponse.json(
            { error: "Failed to create listing" },
            { status: 500 }
        )
    }
}