import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/prisma"

// PATCH /api/listings/[id]/status - Update listing status
export async function PATCH(
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

        const listing = await prisma.listing.findUnique({
            where: { id: params.id },
        })

        if (!listing) {
            return NextResponse.json(
                { error: "Listing not found" },
                { status: 404 }
            )
        }

        if (listing.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            )
        }

        const body = await req.json()
        const { status } = body

        // Validate status value
        if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status. Only ACTIVE and INACTIVE are allowed." },
                { status: 400 }
            )
        }

        // Prevent changing status of MATCHED or EXPIRED listings
        if (listing.status === "MATCHED" || listing.status === "EXPIRED") {
            return NextResponse.json(
                { error: "Cannot change status of MATCHED or EXPIRED listings" },
                { status: 400 }
            )
        }

        const updatedListing = await prisma.listing.update({
            where: { id: params.id },
            data: { status },
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
            },
        })

        return NextResponse.json({ listing: updatedListing })
    } catch (error) {
        console.error("Error updating listing status:", error)
        return NextResponse.json(
            { error: "Failed to update listing status" },
            { status: 500 }
        )
    }
}
