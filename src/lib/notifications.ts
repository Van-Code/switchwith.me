/**
 * Notification Helper Functions
 *
 * Handles creating in-app notifications and triggering email notifications
 */

import { prisma } from "@/lib/db";
import { NotificationType } from "@prisma/client";
import { sendNotificationEmail } from "./emailNotifications";

/**
 * Data structures for different notification types
 */
export interface MessageNotificationData {
  conversationId: string;
  messageId: string;
  senderName: string;
  preview: string;
}

export interface MatchNotificationData {
  listingId: string;
  matchedListingId: string;
  matchScore?: number;
  description?: string;
}

export type NotificationData = MessageNotificationData | MatchNotificationData;

/**
 * Creates a notification for a user
 * Automatically triggers email if user has email notifications enabled
 */
export async function createNotification({
  userId,
  type,
  data,
}: {
  userId: string;
  type: NotificationType;
  data: NotificationData;
}) {
  try {
    // Create the in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        data: data as any, // Prisma Json type
        isRead: false,
      },
    });

    // Fetch user to check email preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        emailNotificationsEnabled: true,
      },
    });

    // Send email if enabled
    if (user?.emailNotificationsEnabled && user.email) {
      await sendNotificationEmail({
        to: user.email,
        userName: user.name || "there",
        type,
        data,
      }).catch((error) => {
        // Log email errors but don't fail the notification creation
        console.error("Failed to send notification email:", error);
      });
    }

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}

/**
 * Creates a MESSAGE notification when a user receives a new message
 */
export async function createMessageNotification({
  recipientId,
  conversationId,
  messageId,
  senderName,
  messagePreview,
}: {
  recipientId: string;
  conversationId: string;
  messageId: string;
  senderName: string;
  messagePreview: string;
}) {
  const preview = messagePreview.length > 100
    ? messagePreview.substring(0, 100) + "..."
    : messagePreview;

  return createNotification({
    userId: recipientId,
    type: "MESSAGE",
    data: {
      conversationId,
      messageId,
      senderName,
      preview,
    },
  });
}

/**
 * Creates a MATCH notification when a new match is found for a user
 */
export async function createMatchNotification({
  userId,
  listingId,
  matchedListingId,
  matchScore,
  description,
}: {
  userId: string;
  listingId: string;
  matchedListingId: string;
  matchScore?: number;
  description?: string;
}) {
  return createNotification({
    userId,
    type: "MATCH",
    data: {
      listingId,
      matchedListingId,
      matchScore,
      description: description || "We found a potential seat match for you!",
    },
  });
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId, // Ensure user owns this notification
    },
    data: {
      isRead: true,
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications({
  userId,
  unreadOnly = false,
  limit = 50,
}: {
  userId: string;
  unreadOnly?: boolean;
  limit?: number;
}) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}
