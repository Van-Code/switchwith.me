import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = 'force-dynamic';

// POST /api/listings/[id]/boost - Boost a listing (paid feature)
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Find the listing
        const listing = await prisma.listing.findUnique({
            where: { id: params.id },
        })

        if (!listing) {
            return NextResponse.json(
                { error: "Listing not found" },
                { status: 404 }
            )
        }

        // Check if user owns the listing
        if (listing.userId !== session.user.id) {
            return NextResponse.json(
                { error: "You can only boost your own listings" },
                { status: 403 }
            )
        }

        // Check if listing is already boosted
        if (listing.boosted) {
            return NextResponse.json(
                { error: "Listing is already boosted" },
                { status: 400 }
            )
        }

        // TODO: In the future, integrate with Stripe for payment
        // For now, we simulate payment success

        // Update the listing to be boosted
        const boostedListing = await prisma.listing.update({
            where: { id: params.id },
            data: {
                boosted: true,
                boostedAt: new Date(),
            },
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logoUrl: true,
                        primaryColor: true,
                        secondaryColor: true,
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            listing: boostedListing,
            message: "Listing boosted successfully",
        })
    } catch (error) {
        console.error("Error boosting listing:", error)
        return NextResponse.json(
            { error: "Failed to boost listing" },
            { status: 500 }
        )
    }
}
