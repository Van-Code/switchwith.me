/**
 * POST /api/profile/notifications
 *
 * Updates the user's email notification preferences
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface UpdateNotificationSettingsRequest {
  emailNotificationsEnabled: boolean;
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
    const body: UpdateNotificationSettingsRequest = await request.json();

    // Validate input
    if (typeof body.emailNotificationsEnabled !== "boolean") {
      return NextResponse.json(
        { error: "emailNotificationsEnabled must be a boolean" },
        { status: 400 }
      );
    }

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailNotificationsEnabled: body.emailNotificationsEnabled,
      },
      select: {
        id: true,
        emailNotificationsEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      emailNotificationsEnabled: updatedUser.emailNotificationsEnabled,
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
