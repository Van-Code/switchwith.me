import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * GET /api/admin/photo-reports
 * Get all photo reports (admin only)
 */
export async function GET() {
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

    // Fetch all reports with related data
    const reports = await prisma.photoReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastInitial: true,
              },
            },
          },
        },
        reportedUser: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastInitial: true,
              },
            },
          },
        },
        photo: true,
      },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Error fetching photo reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}
