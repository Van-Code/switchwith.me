# Notifications System Implementation Guide

Complete guide for implementing the notifications system in your Valkyries Seat Swap app.

## Overview

This notification system provides:
- ✅ In-app notifications for messages and matches
- ✅ Email notifications via SpaceMail (opt-in)
- ✅ Notification bell in navigation with unread count
- ✅ Dropdown showing recent notifications
- ✅ User settings to control email notifications

## 📋 Table of Contents

1. [Database Setup](#1-database-setup)
2. [Environment Variables](#2-environment-variables)
3. [Core Files](#3-core-files)
4. [Integration Steps](#4-integration-steps)
5. [Testing](#5-testing)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Database Setup

### Step 1: Update Prisma Schema

Copy the contents from `prisma/schema-notification-updates.prisma` into your main `schema.prisma` file:

1. Add the `NotificationType` enum
2. Add `emailNotificationsEnabled` field to your `User` model
3. Add the complete `Notification` model

### Step 2: Run Migration

```bash
npx prisma migrate dev --name add_notifications
npx prisma generate
```

This will:
- Create the `Notification` table
- Add the `NotificationType` enum
- Update your User table with the email notification preference field
- Generate updated TypeScript types

---

## 2. Environment Variables

Add these to your `.env` file:

```env
# SpaceMail Configuration
SPACEMAIL_API_KEY=your_spacemail_api_key_here
SPACEMAIL_FROM=notifications@yourdomain.com

# Optional: Override recipient email for testing
# SPACEMAIL_NOTIFICATION_TO_OVERRIDE=your-test-email@example.com

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://valkyriesswap.com
# or for development:
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### SpaceMail Setup

1. Sign in to [SpaceMail](https://spacemail.com)
2. Get your API key from the dashboard
3. Verify your sending domain
4. Update the API endpoint in `src/lib/emailNotifications.ts` if needed (check SpaceMail docs)

---

## 3. Core Files

### Files Created

| File | Purpose |
|------|---------|
| `prisma/schema-notification-updates.prisma` | Database schema changes |
| `src/lib/notifications.ts` | Core notification functions |
| `src/lib/emailNotifications.ts` | Email sending via SpaceMail |
| `app/api/notifications/route.ts` | GET notifications endpoint |
| `app/api/notifications/read/route.ts` | Mark as read endpoint |
| `app/api/profile/notifications/route.ts` | Update user preferences |
| `src/components/notification-bell.tsx` | Bell icon with dropdown |
| `src/components/notification-settings.tsx` | Settings UI component |

### Example Files (for reference)

| File | Purpose |
|------|---------|
| `app/api/conversations/[id]/messages/route.example.ts` | Message creation integration |
| `src/lib/matching.example.ts` | Match notification integration |
| `app/profile/page.example.tsx` | Profile page with settings |
| `src/components/navbar.example.tsx` | Navbar integration |

---

## 4. Integration Steps

### Step 1: Add NotificationBell to Navigation

In your main navigation component (e.g., `src/components/navbar.tsx` or `app/layout.tsx`):

```tsx
import { NotificationBell } from "@/components/notification-bell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav>
      {/* Your existing nav items */}

      {session?.user && (
        <NotificationBell />
      )}

      {/* Profile menu, etc. */}
    </nav>
  );
}
```

### Step 2: Integrate Message Notifications

In your message creation route (e.g., `app/api/conversations/[id]/messages/route.ts`):

```tsx
import { createMessageNotification } from "@/lib/notifications";

// After creating a message:
const message = await prisma.message.create({
  data: {
    conversationId,
    senderId: session.user.id,
    content: body.content,
  },
  include: {
    sender: { select: { id: true, name: true } },
  },
});

// Get the recipient (the other participant in the conversation)
const recipient = conversation.participants.find(
  (p) => p.id !== session.user.id
);

// Create notification (don't await - fire and forget)
if (recipient) {
  createMessageNotification({
    recipientId: recipient.id,
    conversationId: conversation.id,
    messageId: message.id,
    senderName: message.sender.name || "Someone",
    messagePreview: body.content,
  }).catch((error) => {
    console.error("Failed to create message notification:", error);
  });
}
```

### Step 3: Integrate Match Notifications

In your match generation code (e.g., `src/lib/matching.ts` or similar):

```tsx
import { createMatchNotification } from "@/lib/notifications";

// When you find a match for a user:
await createMatchNotification({
  userId: user.id,
  listingId: listing.id,
  matchedListingId: matchedListing.id,
  matchScore: 95, // optional
  description: "Great news! Someone has what you're looking for.",
}).catch((error) => {
  console.error("Failed to create match notification:", error);
});
```

### Step 4: Add Notification Settings to Profile

In your profile or settings page:

```tsx
import { NotificationSettings } from "@/components/notification-settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      emailNotificationsEnabled: true,
    },
  });

  return (
    <div>
      <h1>Profile Settings</h1>

      <NotificationSettings
        initialEmailNotificationsEnabled={user.emailNotificationsEnabled}
      />
    </div>
  );
}
```

### Step 5: Ensure Database Connection

Make sure you have `src/lib/db.ts` (or similar) that exports a Prisma client:

```tsx
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## 5. Testing

### Test In-App Notifications

1. **Send a test message**:
   - Log in as User A
   - Send a message to User B
   - Log in as User B
   - Check the notification bell - should show unread count
   - Click the bell - should see the message notification

2. **Test notification click**:
   - Click on a notification
   - Should navigate to the conversation
   - Notification should be marked as read
   - Unread count should decrease

### Test Email Notifications

1. **Enable email notifications**:
   - Go to Profile > Notifications
   - Toggle "Email me when I get new messages or matches"
   - Verify the setting is saved

2. **Send a test message**:
   - Send a message to a user with email notifications enabled
   - Check the user's email inbox
   - Should receive an email with the message preview

3. **Test development override**:
   - Set `SPACEMAIL_NOTIFICATION_TO_OVERRIDE=your-email@example.com`
   - All notification emails will go to this address
   - Useful for testing without real user emails

### Test Edge Cases

- [ ] User sends message to themselves (should not create notification)
- [ ] User with email notifications disabled (should not receive email)
- [ ] Notification for non-existent user (should handle gracefully)
- [ ] Mark all as read with no notifications
- [ ] Open dropdown with slow network (should show loading state)

---

## 6. Troubleshooting

### Notifications Not Appearing

**Check:**
- Database migration ran successfully
- Notification was created in the database (check with Prisma Studio)
- User is authenticated
- API route returns notifications for the user

**Debug:**
```bash
# Check database
npx prisma studio

# Check API response
curl http://localhost:3000/api/notifications \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Email Notifications Not Sending

**Check:**
- `SPACEMAIL_API_KEY` is set correctly
- `SPACEMAIL_FROM` is a verified sender in SpaceMail
- User has `emailNotificationsEnabled: true`
- User has a valid email address
- SpaceMail API endpoint is correct (check docs)

**Debug:**
```typescript
// Add logging to src/lib/emailNotifications.ts
console.log("Sending email to:", recipientEmail);
console.log("SpaceMail response:", await response.text());
```

### Bell Icon Not Showing

**Check:**
- User is authenticated
- Component is imported correctly
- Component is inside the authenticated section of nav

### Unread Count Not Updating

**Check:**
- Notifications are being marked as read in the database
- Component is polling (check Network tab for /api/notifications calls)
- Browser console for errors

---

## API Reference

### GET /api/notifications

Fetch notifications for the authenticated user.

**Query Parameters:**
- `unreadOnly` (optional): "true" to fetch only unread notifications
- `limit` (optional): Number of notifications to return (default: 50, max: 100)

**Response:**
```json
{
  "notifications": [
    {
      "id": "clx123...",
      "type": "MESSAGE",
      "data": {
        "conversationId": "clx456...",
        "messageId": "clx789...",
        "senderName": "Alice",
        "preview": "Hey, are you still interested..."
      },
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

### POST /api/notifications/read

Mark notifications as read.

**Request Body:**

Mark single notification:
```json
{
  "id": "clx123..."
}
```

Mark all notifications:
```json
{
  "all": true
}
```

**Response:**
```json
{
  "success": true,
  "unreadCount": 0
}
```

### POST /api/profile/notifications

Update user's email notification preferences.

**Request Body:**
```json
{
  "emailNotificationsEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "emailNotificationsEnabled": true
}
```

---

## Future Enhancements

Consider adding:
- [ ] Push notifications (using Web Push API)
- [ ] Notification preferences per type (separate toggles for messages vs matches)
- [ ] Email digest (daily/weekly summary instead of immediate emails)
- [ ] Mark as read when visiting the linked page
- [ ] Delete notifications
- [ ] Notification retention policy (auto-delete after 30 days)
- [ ] Real-time updates via WebSocket or Server-Sent Events
- [ ] Batch notification creation for multiple matches

---

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review the example files for correct integration patterns
3. Check browser console and server logs for errors
4. Verify environment variables are set correctly
5. Test with Prisma Studio to inspect database state

---

## Summary

You now have a complete notification system with:
- ✅ In-app notifications
- ✅ Email notifications (opt-in)
- ✅ Notification bell with unread count
- ✅ Notification dropdown
- ✅ User preference settings

The system is production-ready, follows Next.js 14 best practices, and properly separates server and client components.
