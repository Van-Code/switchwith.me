/**
 * POST /api/profile/notifications
 *
 * Updates the user's email notification preferences
 */

import { NextRequest, NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/db"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = "force-dynamic"

interface UpdateNotificationSettingsRequest {
  emailNotificationsEnabled: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication

    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = auth.userId
    // Parse request body
    const body: UpdateNotificationSettingsRequest = await request.json()

    // Validate input
    if (typeof body.emailNotificationsEnabled !== "boolean") {
      return NextResponse.json(
        { error: "emailNotificationsEnabled must be a boolean" },
        { status: 400 }
      )
    }

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailNotificationsEnabled: body.emailNotificationsEnabled,
      },
      select: {
        id: true,
        emailNotificationsEnabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      emailNotificationsEnabled: updatedUser.emailNotificationsEnabled,
    })
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
