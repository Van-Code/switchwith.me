import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * POST /api/admin/photo-reports/[id]/resolve
 * Mark a photo report as resolved (admin only)
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
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

    const { id } = params

    // Update the report
    const report = await prisma.photoReport.update({
      where: { id },
      data: { resolved: true },
    })

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Error resolving report:", error)
    return NextResponse.json({ error: "Failed to resolve report" }, { status: 500 })
  }
}
