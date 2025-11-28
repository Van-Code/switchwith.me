# 🔔 Notifications System for Valkyries Seat Swap

Complete, production-ready notification system for your Next.js 14 app.

## What's Included

✅ **In-app notifications** - Bell icon with unread count and dropdown
✅ **Email notifications** - Optional emails via SpaceMail
✅ **Message notifications** - Get notified of new messages
✅ **Match notifications** - Get notified of new seat matches
✅ **User preferences** - Toggle email notifications on/off
✅ **Clean, minimal UI** - Using shadcn/ui components
✅ **Type-safe** - Full TypeScript support
✅ **Next.js 14 ready** - App Router, Server/Client components properly separated

## 📚 Documentation

Start here based on what you need:

| Document | When to Use |
|----------|-------------|
| **[Quick Reference](NOTIFICATIONS_QUICK_REFERENCE.md)** | You know what you're doing, just need syntax |
| **[Implementation Guide](NOTIFICATIONS_IMPLEMENTATION_GUIDE.md)** | Step-by-step setup instructions |
| **[Checklist](NOTIFICATIONS_CHECKLIST.md)** | Track your implementation progress |

## 🚀 Quick Start (5 minutes)

1. **Update database:**
   ```bash
   # Copy schema updates from prisma/schema-notification-updates.prisma to your schema.prisma
   npx prisma migrate dev --name add_notifications
   npx prisma generate
   ```

2. **Set environment variables:**
   ```env
   SPACEMAIL_API_KEY=your_key
   SPACEMAIL_FROM=notifications@yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Add bell to navigation:**
   ```tsx
   import { NotificationBell } from "@/components/notification-bell";

   {session?.user && <NotificationBell />}
   ```

4. **Create notifications when messages are sent:**
   ```tsx
   import { createMessageNotification } from "@/lib/notifications";

   // After creating a message:
   createMessageNotification({
     recipientId: recipient.id,
     conversationId: conversation.id,
     messageId: message.id,
     senderName: sender.name,
     messagePreview: content,
   }).catch(console.error);
   ```

5. **Test it:**
   - Send a message between two users
   - Check the notification bell
   - Should see unread count and notification

## 📁 File Structure

```
kidney-swap/
├── prisma/
│   └── schema-notification-updates.prisma    # Database schema changes
├── src/
│   ├── lib/
│   │   ├── notifications.ts                  # Core notification logic
│   │   └── emailNotifications.ts             # SpaceMail integration
│   └── components/
│       ├── notification-bell.tsx             # Bell icon + dropdown
│       └── notification-settings.tsx         # Settings UI
├── app/
│   └── api/
│       ├── notifications/
│       │   ├── route.ts                      # GET notifications
│       │   └── read/route.ts                 # Mark as read
│       └── profile/
│           └── notifications/route.ts        # Update preferences
└── examples/ (for reference)
    ├── route.example.ts                      # Message integration
    ├── matching.example.ts                   # Match integration
    ├── page.example.tsx                      # Profile page
    └── navbar.example.tsx                    # Navbar integration
```

## 🎯 Key Features

### In-App Notifications

- Bell icon in navigation
- Unread count badge
- Dropdown with recent notifications
- Auto-refresh every 30 seconds
- Mark individual or all as read
- Direct links to conversations/matches

### Email Notifications

- Opt-in via user settings
- Sent via SpaceMail API
- Includes message preview
- Links back to the app
- Development override for testing

### Developer Experience

- TypeScript everywhere
- Proper error handling
- Fire-and-forget (non-blocking)
- Easy to customize
- Well-documented
- Example code included

## 🔧 Customization

Common customizations are easy:

- **Change notification types**: Add to `NotificationType` enum
- **Customize email templates**: Edit `src/lib/emailNotifications.ts`
- **Change polling interval**: Edit `src/components/notification-bell.tsx`
- **Customize notification links**: Edit `getNotificationContent()` function
- **Add notification preferences**: Extend User model and settings UI

See the [Quick Reference](NOTIFICATIONS_QUICK_REFERENCE.md#-common-customizations) for code examples.

## 🧪 Testing

```bash
# 1. Run migrations
npx prisma migrate dev

# 2. Start dev server
npm run dev

# 3. Open Prisma Studio (to inspect database)
npx prisma studio

# 4. Test flow:
# - Create two users
# - Send message from User A to User B
# - Log in as User B
# - Check notification bell (should show unread)
# - Enable email notifications in profile
# - Send another message
# - Check email inbox
```

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/notifications` | GET | Fetch user's notifications |
| `/api/notifications/read` | POST | Mark notifications as read |
| `/api/profile/notifications` | POST | Update email preferences |

Full API documentation in the [Implementation Guide](NOTIFICATIONS_IMPLEMENTATION_GUIDE.md#api-reference).

## 🐛 Troubleshooting

**Notifications not appearing?**
- Check database migration ran successfully
- Verify notification was created in Prisma Studio
- Check browser console for errors

**Emails not sending?**
- Verify `SPACEMAIL_API_KEY` is set
- Check user has `emailNotificationsEnabled: true`
- Check SpaceMail API endpoint is correct
- Look for errors in server logs

See full [Troubleshooting Guide](NOTIFICATIONS_IMPLEMENTATION_GUIDE.md#6-troubleshooting).

## 🚀 Production Checklist

Before deploying:

- [ ] All environment variables set in production
- [ ] Remove `SPACEMAIL_NOTIFICATION_TO_OVERRIDE`
- [ ] Test email sending with real SpaceMail account
- [ ] Verify notification links use production URL
- [ ] Test with real users
- [ ] Monitor error logs

## 📈 Future Enhancements

Consider adding:
- Push notifications (Web Push API)
- Real-time updates (WebSockets)
- Email digests (daily/weekly summary)
- Notification preferences per type
- Notification retention policy
- "Snooze" functionality

See [full list](NOTIFICATIONS_IMPLEMENTATION_GUIDE.md#future-enhancements).

## 🤝 Support

Questions? Issues?

1. Check the [Implementation Guide](NOTIFICATIONS_IMPLEMENTATION_GUIDE.md)
2. Review [Quick Reference](NOTIFICATIONS_QUICK_REFERENCE.md)
3. Check example files for integration patterns
4. Review browser console and server logs

## 📝 License

This notification system is part of your Valkyries Seat Swap project.

---

**Ready to implement?** Start with the [Implementation Guide](NOTIFICATIONS_IMPLEMENTATION_GUIDE.md) or jump straight to the [Checklist](NOTIFICATIONS_CHECKLIST.md).
