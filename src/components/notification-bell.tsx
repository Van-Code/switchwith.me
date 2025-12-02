"use client";

/**
 * NotificationBell Component
 *
 * Shows a bell icon with unread count badge
 * Opens a dropdown with recent notifications
 * Polls for new notifications every 30 seconds
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationData {
  conversationId?: string;
  messageId?: string;
  senderName?: string;
  preview?: string;
  listingId?: string;
  matchedListingId?: string;
  matchScore?: number;
  description?: string;
}

interface Notification {
  id: string;
  type: "MESSAGE" | "MATCH";
  data: NotificationData;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=20");

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data: NotificationsResponse = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: notificationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      const data = await response.json();

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ all: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      const data = await response.json();

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  // Handle notification click
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      // Mark as read if not already read
      if (!notification.isRead) {
        markAsRead(notification.id);
      }

      // Close the dropdown
      setIsOpen(false);
    },
    [markAsRead]
  );

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                You&apos;re all caught up.
              </p>
              <p className="text-sm text-muted-foreground">
                No new notifications right now.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Individual notification item
 */
function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const { type, data, isRead, createdAt } = notification;

  // Generate notification content based on type
  const { icon, title, description, linkHref } = getNotificationContent(
    type,
    data
  );

  // Format relative time
  const relativeTime = formatRelativeTime(createdAt);

  return (
    <DropdownMenuItem asChild className="cursor-pointer">
      <Link
        href={linkHref}
        onClick={onClick}
        className={`flex gap-3 p-3 ${!isRead ? "bg-accent/50" : ""}`}
      >
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="flex-1 space-y-1 min-w-0">
          <p className="text-sm font-medium leading-none">{title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
          <p className="text-xs text-muted-foreground">{relativeTime}</p>
        </div>
        {!isRead && (
          <div className="flex-shrink-0">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
        )}
      </Link>
    </DropdownMenuItem>
  );
}

/**
 * Get notification content based on type
 */
function getNotificationContent(type: string, data: NotificationData) {
  switch (type) {
    case "MESSAGE":
      return {
        icon: <Bell className="h-4 w-4" />,
        title: data.senderName ? `New message from ${data.senderName}` : "New message",
        description: data.preview || "Sent you a message",
        linkHref: `/conversations/${data.conversationId}`,
      };

    case "MATCH":
      return {
        icon: <Bell className="h-4 w-4" />,
        title: "New match suggestion",
        description:
          data.description || "We found a potential seat match for you!",
        linkHref: `/matches`,
      };

    default:
      return {
        icon: <Bell className="h-4 w-4" />,
        title: "New notification",
        description: "You have a new notification",
        linkHref: "/",
      };
  }
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  }

  // For older notifications, show the date
  return date.toLocaleDateString();
}
