import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"
import { generateUploadPresignedUrl, deleteProfilePhoto } from "@/lib/s3"

export const dynamic = "force-dynamic"

/**
 * GET /api/profile/photo
 * Returns a presigned URL for uploading a profile photo
 */
export async function GET(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = auth.userId

    const { searchParams } = new URL(req.url)
    const fileExtension = searchParams.get("ext")

    if (!fileExtension) {
      return NextResponse.json({ error: "File extension required" }, { status: 400 })
    }

    // Validate file extension
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"]
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file extension. Allowed: jpg, jpeg, png, webp" },
        { status: 400 }
      )
    }

    const { uploadUrl, key } = await generateUploadPresignedUrl(
      userId,
      fileExtension.toLowerCase()
    )

    return NextResponse.json({ uploadUrl, key })
  } catch (error) {
    console.error("Error generating presigned URL:", error)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}

/**
 * POST /api/profile/photo
 * Confirms the upload and saves the S3 key to the database
 */
export async function POST(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId

    const body = await req.json()
    const { key } = body

    if (!key) {
      return NextResponse.json({ error: "S3 key required" }, { status: 400 })
    }

    // Delete old photo if exists
    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
      select: { avatarUrl: true },
    })

    if (profile?.avatarUrl) {
      try {
        await deleteProfilePhoto(profile.avatarUrl)
      } catch (error) {
        console.error("Error deleting old photo:", error)
        // Continue even if delete fails
      }
    }

    // Update profile with new S3 key
    await prisma.profile.update({
      where: { userId: userId },
      data: { avatarUrl: key },
    })

    return NextResponse.json({ success: true, key })
  } catch (error) {
    console.error("Error saving photo:", error)
    return NextResponse.json({ error: "Failed to save photo" }, { status: 500 })
  }
}

/**
 * DELETE /api/profile/photo
 * Deletes the profile photo from S3 and clears the avatarUrl
 */
export async function DELETE() {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
      select: { avatarUrl: true },
    })

    if (!profile?.avatarUrl) {
      return NextResponse.json({ error: "No photo to delete" }, { status: 404 })
    }

    // Delete from S3
    await deleteProfilePhoto(profile.avatarUrl)

    // Clear avatarUrl in database
    await prisma.profile.update({
      where: { userId: userId },
      data: { avatarUrl: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting photo:", error)
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}
