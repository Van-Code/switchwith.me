import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteProfilePhoto } from "@/lib/s3"

export const dynamic = "force-dynamic"

/**
 * POST /api/admin/photo-reports/[id]/remove-photo
 * Remove the photo associated with a report (admin only)
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    // Find the report with photo
    const report = await prisma.photoReport.findUnique({
      where: { id },
      include: { photo: true },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    const photoUrl = report.photo.url

    // Delete photo from S3
    try {
      await deleteProfilePhoto(photoUrl)
    } catch (error) {
      console.error("Error deleting photo from S3:", error)
      // Continue even if S3 delete fails
    }

    // Delete photo from database (this will cascade delete all reports for this photo)
    await prisma.profilePhoto.delete({
      where: { id: report.photoId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing photo:", error)
    return NextResponse.json(
      { error: "Failed to remove photo" },
      { status: 500 }
    )
  }
}
