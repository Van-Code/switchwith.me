import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"
import { generateProfilePhotoUploadUrl, deleteProfilePhoto } from "@/lib/s3"

export const dynamic = "force-dynamic"

/**
 * GET /api/profile/photos
 * Returns presigned URL for uploading a profile photo
 */
export async function GET(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId

    const { searchParams } = new URL(req.url)
    const orderStr = searchParams.get("order")
    const fileExtension = searchParams.get("ext")

    if (!orderStr || !fileExtension) {
      return NextResponse.json(
        { error: "Order and file extension required" },
        { status: 400 }
      )
    }

    const order = parseInt(orderStr)
    if (order < 0 || order > 2) {
      return NextResponse.json({ error: "Order must be 0, 1, or 2" }, { status: 400 })
    }

    // Validate file extension
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"]
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file extension. Allowed: jpg, jpeg, png, webp" },
        { status: 400 }
      )
    }

    // Check if user already has 3 photos (and this would be a 4th)
    const existingPhotos = await prisma.profilePhoto.findMany({
      where: { userId: userId },
    })

    const existingPhotoAtOrder = existingPhotos.find((p) => p.order === order)

    // If adding a new photo (not replacing), check the limit
    if (!existingPhotoAtOrder && existingPhotos.length >= 3) {
      return NextResponse.json({ error: "Maximum 3 photos allowed" }, { status: 400 })
    }

    const { uploadUrl, key } = await generateProfilePhotoUploadUrl(
      userId,
      order,
      fileExtension.toLowerCase()
    )

    return NextResponse.json({ uploadUrl, key, order })
  } catch (error) {
    console.error("Error generating presigned URL:", error)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}

/**
 * POST /api/profile/photos
 * Confirms upload and saves the photo to database
 */
export async function POST(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId
    const body = await req.json()
    const { key, order } = body

    if (!key || order === undefined) {
      return NextResponse.json({ error: "S3 key and order required" }, { status: 400 })
    }

    if (order < 0 || order > 2) {
      return NextResponse.json({ error: "Order must be 0, 1, or 2" }, { status: 400 })
    }

    // Delete old photo at this order if exists
    const existingPhoto = await prisma.profilePhoto.findUnique({
      where: {
        userId_order: {
          userId: userId,
          order,
        },
      },
    })

    if (existingPhoto) {
      try {
        await deleteProfilePhoto(existingPhoto.url)
      } catch (error) {
        console.error("Error deleting old photo from S3:", error)
        // Continue even if delete fails
      }

      // Delete from database
      await prisma.profilePhoto.delete({
        where: { id: existingPhoto.id },
      })
    }

    // Create new photo record
    const photo = await prisma.profilePhoto.create({
      data: {
        userId: userId,
        url: key,
        order,
      },
    })

    return NextResponse.json({ success: true, photo })
  } catch (error) {
    console.error("Error saving photo:", error)
    return NextResponse.json({ error: "Failed to save photo" }, { status: 500 })
  }
}

/**
 * DELETE /api/profile/photos
 * Deletes a specific photo
 */
export async function DELETE(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId

    const { searchParams } = new URL(req.url)
    const photoId = searchParams.get("id")

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 })
    }

    // Find the photo and verify ownership
    const photo = await prisma.profilePhoto.findUnique({
      where: { id: photoId },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    if (photo.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete from S3
    try {
      await deleteProfilePhoto(photo.url)
    } catch (error) {
      console.error("Error deleting photo from S3:", error)
      // Continue even if S3 delete fails
    }

    // Delete from database
    await prisma.profilePhoto.delete({
      where: { id: photoId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting photo:", error)
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}
