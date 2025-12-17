import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * GET /api/admin/photo-reports
 * Get all photo reports (admin only)
 */
export async function GET() {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
