import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * POST /api/profile/photos/report
 * Create a report for a profile photo
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { photoId, reason, details } = body

    if (!photoId || !reason) {
      return NextResponse.json(
        { error: "Photo ID and reason required" },
        { status: 400 }
      )
    }

    // Validate reason
    const validReasons = ["CONTACT_INFO", "INAPPROPRIATE", "HARASSMENT", "OTHER"]
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 })
    }

    // Validate details length if provided
    if (details && details.length > 300) {
      return NextResponse.json(
        { error: "Details must be 300 characters or less" },
        { status: 400 }
      )
    }

    // Find the photo to get the reported user ID
    const photo = await prisma.profilePhoto.findUnique({
      where: { id: photoId },
      select: { userId: true },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // Prevent users from reporting their own photos
    if (photo.userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot report your own photo" },
        { status: 400 }
      )
    }

    // Create the report
    const report = await prisma.photoReport.create({
      data: {
        reporterId: session.user.id,
        reportedUserId: photo.userId,
        photoId,
        reason,
        details: details || null,
      },
    })

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Error creating photo report:", error)
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    )
  }
}
