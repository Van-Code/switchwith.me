/**
 * GET /api/notifications
 *
 * Fetches notifications for the authenticated user
 * Query params:
 *   - unreadOnly: "true" to fetch only unread notifications
 *   - limit: number of notifications to return (default 50)
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserNotifications, getUnreadCount } from "@/lib/notifications"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 50

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid limit parameter. Must be between 1 and 100." },
        { status: 400 }
      )
    }

    // Fetch notifications
    const notifications = await getUserNotifications({
      userId: session.user.id,
      unreadOnly,
      limit
    })

    // Get unread count
    const unreadCount = await getUnreadCount(session.user.id)

    // Format the response
    const formattedNotifications = notifications.map((notification: any) => ({
      id: notification.id,
      type: notification.type,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString()
    }))

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
