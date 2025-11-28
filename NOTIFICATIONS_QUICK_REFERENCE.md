# Notifications System - Quick Reference

Fast reference for common notification tasks.

## 📦 Import Statements

```typescript
// Notification creation
import {
  createMessageNotification,
  createMatchNotification,
  createNotification
} from "@/lib/notifications";

// UI Components
import { NotificationBell } from "@/components/notification-bell";
import { NotificationSettings } from "@/components/notification-settings";

// Email sending (if needed directly)
import { sendNotificationEmail } from "@/lib/emailNotifications";
```

## 🔔 Creating Notifications

### Message Notification

```typescript
// When a user receives a new message
await createMessageNotification({
  recipientId: "user_123",           // User who receives the notification
  conversationId: "conv_456",        // Conversation ID
  messageId: "msg_789",              // The new message ID
  senderName: "Alice",               // Name to display
  messagePreview: "Hey, are you..." // First ~100 chars of message
});
```

### Match Notification

```typescript
// When a match is found for a user
await createMatchNotification({
  userId: "user_123",                 // User who receives the notification
  listingId: "listing_456",           // User's listing
  matchedListingId: "listing_789",    // The matched listing
  matchScore: 95,                     // Optional: match quality score
  description: "Great news! ..."      // Optional: custom description
});
```

### Generic Notification (Advanced)

```typescript
// For custom notification types
import { createNotification } from "@/lib/notifications";

await createNotification({
  userId: "user_123",
  type: "MESSAGE", // or "MATCH"
  data: {
    // Your custom data object
    conversationId: "conv_456",
    customField: "value"
  }
});
```

## 🎯 Usage Patterns

### In API Routes

```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // ... create message/match ...

  // Fire and forget - don't block response
  createMessageNotification({
    recipientId: recipient.id,
    conversationId: conversationId,
    messageId: message.id,
    senderName: session.user.name || "Someone",
    messagePreview: messageContent,
  }).catch((error) => {
    console.error("Notification error:", error);
  });

  return NextResponse.json({ success: true });
}
```

### In Server Actions

```typescript
"use server";

export async function sendMessage(conversationId: string, content: string) {
  const session = await getServerSession(authOptions);

  // Create message
  const message = await prisma.message.create({
    data: { conversationId, senderId: session.user.id, content }
  });

  // Notify recipient (async)
  createMessageNotification({
    recipientId: recipientId,
    conversationId: conversationId,
    messageId: message.id,
    senderName: session.user.name || "Someone",
    messagePreview: content,
  }).catch(console.error);

  return message;
}
```

## 🎨 UI Components

### Notification Bell (in Navigation)

```typescript
// In your Navbar or Layout
import { NotificationBell } from "@/components/notification-bell";
import { getServerSession } from "next-auth";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav>
      {/* ... other nav items ... */}

      {session?.user && <NotificationBell />}
    </nav>
  );
}
```

### Notification Settings (in Profile)

```typescript
// In your Profile/Settings page
import { NotificationSettings } from "@/components/notification-settings";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailNotificationsEnabled: true }
  });

  return (
    <div>
      <NotificationSettings
        initialEmailNotificationsEnabled={user.emailNotificationsEnabled}
      />
    </div>
  );
}
```

## 📡 API Endpoints

### Fetch Notifications

```typescript
// Client-side
const response = await fetch("/api/notifications?unreadOnly=true&limit=20");
const { notifications, unreadCount } = await response.json();
```

### Mark as Read

```typescript
// Mark single notification
await fetch("/api/notifications/read", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: "notification_id" })
});

// Mark all notifications
await fetch("/api/notifications/read", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ all: true })
});
```

### Update Email Preferences

```typescript
// Client-side
await fetch("/api/profile/notifications", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ emailNotificationsEnabled: true })
});
```

## 🔧 Common Customizations

### Custom Notification Link

Edit `src/components/notification-bell.tsx`:

```typescript
function getNotificationContent(type: string, data: NotificationData) {
  switch (type) {
    case "MESSAGE":
      return {
        icon: <Bell className="h-4 w-4" />,
        title: "New message",
        description: data.preview,
        linkHref: `/conversations/${data.conversationId}`, // ← Change this
      };
    // ...
  }
}
```

### Custom Email Template

Edit `src/lib/emailNotifications.ts`:

```typescript
function buildMessageEmail(userName: string, data: MessageNotificationData) {
  return {
    subject: "Your custom subject",
    text: `Your custom email body...`
  };
}
```

### Change Polling Interval

Edit `src/components/notification-bell.tsx`:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchNotifications();
  }, 60000); // ← Change from 30000 (30s) to 60000 (60s)

  return () => clearInterval(interval);
}, [fetchNotifications]);
```

### Custom Notification Badge Color

Edit `src/components/notification-bell.tsx`:

```typescript
<Badge
  variant="destructive"  // ← Change to "default", "secondary", etc.
  className="absolute -top-1 -right-1..."
>
  {unreadCount}
</Badge>
```

## 🐛 Debugging

### Check if Notification Was Created

```typescript
// In Prisma Studio or your code
const notifications = await prisma.notification.findMany({
  where: { userId: "user_123" },
  orderBy: { createdAt: "desc" },
  take: 10
});
console.log(notifications);
```

### Check Email Notification Status

```typescript
// In src/lib/emailNotifications.ts, add logging:
console.log("Sending email:", {
  to: recipientEmail,
  subject,
  userHasEmailEnabled: /* value */
});
```

### Check API Response

```bash
# In browser console
fetch('/api/notifications')
  .then(r => r.json())
  .then(console.log)
```

## 📊 Database Queries

### Get Unread Count

```typescript
const unreadCount = await prisma.notification.count({
  where: {
    userId: "user_123",
    isRead: false
  }
});
```

### Get Recent Notifications

```typescript
const notifications = await prisma.notification.findMany({
  where: { userId: "user_123" },
  orderBy: { createdAt: "desc" },
  take: 20
});
```

### Mark All as Read

```typescript
await prisma.notification.updateMany({
  where: {
    userId: "user_123",
    isRead: false
  },
  data: { isRead: true }
});
```

### Delete Old Notifications

```typescript
// Delete notifications older than 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

await prisma.notification.deleteMany({
  where: {
    createdAt: { lt: thirtyDaysAgo }
  }
});
```

## 🔐 Environment Variables Reference

```env
# Required
SPACEMAIL_API_KEY=sk_live_...
SPACEMAIL_FROM=notifications@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional
SPACEMAIL_NOTIFICATION_TO_OVERRIDE=test@example.com  # For testing
```

## 📝 TypeScript Types

```typescript
// Notification type from Prisma
type Notification = {
  id: string;
  userId: string;
  type: "MESSAGE" | "MATCH";
  data: any; // JSON
  isRead: boolean;
  createdAt: Date;
};

// Message notification data
type MessageNotificationData = {
  conversationId: string;
  messageId: string;
  senderName: string;
  preview: string;
};

// Match notification data
type MatchNotificationData = {
  listingId: string;
  matchedListingId: string;
  matchScore?: number;
  description?: string;
};
```

## ⚡ Performance Tips

1. **Don't await notification creation** in user-facing flows:
   ```typescript
   // ❌ Bad - blocks the response
   await createMessageNotification({ ... });
   return NextResponse.json({ success: true });

   // ✅ Good - fire and forget
   createMessageNotification({ ... }).catch(console.error);
   return NextResponse.json({ success: true });
   ```

2. **Use database indexes** (already included in schema):
   ```prisma
   @@index([userId, isRead])
   @@index([userId, createdAt])
   ```

3. **Limit notification queries**:
   ```typescript
   // Always use take/limit
   await prisma.notification.findMany({
     where: { userId },
     take: 50, // Don't fetch unlimited
   });
   ```

4. **Clean up old notifications** periodically (cron job):
   ```typescript
   // Delete notifications older than 90 days
   await prisma.notification.deleteMany({
     where: {
       createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
     }
   });
   ```

---

## 🚀 Quick Start Checklist

- [ ] Schema migrated (`npx prisma migrate dev`)
- [ ] Environment variables set
- [ ] NotificationBell added to navbar
- [ ] NotificationSettings added to profile
- [ ] Message creation calls `createMessageNotification()`
- [ ] Match creation calls `createMatchNotification()`
- [ ] Test end-to-end flow

---

Need more details? See `NOTIFICATIONS_IMPLEMENTATION_GUIDE.md`
