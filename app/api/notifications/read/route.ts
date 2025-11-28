/**
 * POST /api/notifications/read
 *
 * Marks notifications as read for the authenticated user
 * Body:
 *   - { id: "notification_id" } - Mark single notification as read
 *   - { all: true } - Mark all notifications as read
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from "@/lib/notifications";

interface ReadNotificationRequest {
  id?: string;
  all?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ReadNotificationRequest = await request.json();

    // Validate request
    if (!body.id && !body.all) {
      return NextResponse.json(
        { error: "Must provide either 'id' or 'all: true'" },
        { status: 400 }
      );
    }

    if (body.id && body.all) {
      return NextResponse.json(
        { error: "Cannot provide both 'id' and 'all'" },
        { status: 400 }
      );
    }

    // Mark notification(s) as read
    if (body.all) {
      await markAllNotificationsAsRead(session.user.id);
    } else if (body.id) {
      await markNotificationAsRead(body.id, session.user.id);
    }

    // Get updated unread count
    const unreadCount = await getUnreadCount(session.user.id);

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
