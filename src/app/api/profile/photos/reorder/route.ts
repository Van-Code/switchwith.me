import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * POST /api/profile/photos/reorder
 * Reorders photos by swapping two photo orders
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { photoId, direction } = body

    if (!photoId || !direction) {
      return NextResponse.json(
        { error: "Photo ID and direction required" },
        { status: 400 }
      )
    }

    if (direction !== "up" && direction !== "down") {
      return NextResponse.json(
        { error: "Direction must be 'up' or 'down'" },
        { status: 400 }
      )
    }

    // Find the photo and verify ownership
    const photo = await prisma.profilePhoto.findUnique({
      where: { id: photoId },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    if (photo.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const currentOrder = photo.order
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

    // Check bounds
    if (newOrder < 0 || newOrder > 2) {
      return NextResponse.json(
        { error: "Cannot move photo in that direction" },
        { status: 400 }
      )
    }

    // Find the photo at the target position
    const targetPhoto = await prisma.profilePhoto.findUnique({
      where: {
        userId_order: {
          userId: session.user.id,
          order: newOrder,
        },
      },
    })

    // Swap the orders using a transaction
    await prisma.$transaction(async (tx) => {
      // Temporarily set to a non-conflicting order
      await tx.profilePhoto.update({
        where: { id: photo.id },
        data: { order: -1 },
      })

      // Move target photo to current photo's position (if it exists)
      if (targetPhoto) {
        await tx.profilePhoto.update({
          where: { id: targetPhoto.id },
          data: { order: currentOrder },
        })
      }

      // Move current photo to new position
      await tx.profilePhoto.update({
        where: { id: photo.id },
        data: { order: newOrder },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering photos:", error)
    return NextResponse.json(
      { error: "Failed to reorder photos" },
      { status: 500 }
    )
  }
}
