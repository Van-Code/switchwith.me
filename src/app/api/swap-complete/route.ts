import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = "force-dynamic"

// POST /api/swap-complete - Mark a swap as complete
export async function POST(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId
    const body = await req.json()
    const { myListingId, theirListingId } = body

    if (!myListingId || !theirListingId) {
      return NextResponse.json({ error: "Missing listing IDs" }, { status: 400 })
    }

    // Verify ownership of myListing
    const myListing = await prisma.listing.findUnique({
      where: { id: myListingId },
    })

    if (!myListing || myListing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const theirListing = await prisma.listing.findUnique({
      where: { id: theirListingId },
    })

    if (!theirListing) {
      return NextResponse.json({ error: "Other listing not found" }, { status: 404 })
    }

    // Update both listings to MATCHED status
    await prisma.listing.update({
      where: { id: myListingId },
      data: { status: "MATCHED" },
    })

    await prisma.listing.update({
      where: { id: theirListingId },
      data: { status: "MATCHED" },
    })

    // Increment successfulSwapsCount for both users
    await prisma.profile.update({
      where: { userId: userId },
      data: {
        successfulSwapsCount: {
          increment: 1,
        },
      },
    })

    await prisma.profile.update({
      where: { userId: theirListing.userId },
      data: {
        successfulSwapsCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error completing swap:", error)
    return NextResponse.json({ error: "Failed to complete swap" }, { status: 500 })
  }
}
