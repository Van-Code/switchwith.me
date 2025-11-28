# Notifications System - Implementation Checklist

Use this checklist to track your implementation progress.

## ☐ Phase 1: Database Setup

- [ ] Copy schema updates from `prisma/schema-notification-updates.prisma` to your `schema.prisma`
  - [ ] Add `NotificationType` enum
  - [ ] Add `emailNotificationsEnabled` to User model
  - [ ] Add `Notification` model with proper indexes
  - [ ] Add `notifications` relation to User model

- [ ] Run Prisma migration
  ```bash
  npx prisma migrate dev --name add_notifications
  ```

- [ ] Generate Prisma client
  ```bash
  npx prisma generate
  ```

- [ ] Verify migration in Prisma Studio
  ```bash
  npx prisma studio
  ```
  - [ ] Check that Notification table exists
  - [ ] Check that User table has emailNotificationsEnabled column

## ☐ Phase 2: Environment Setup

- [ ] Add environment variables to `.env`:
  - [ ] `SPACEMAIL_API_KEY`
  - [ ] `SPACEMAIL_FROM`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] Optional: `SPACEMAIL_NOTIFICATION_TO_OVERRIDE` (for testing)

- [ ] Verify SpaceMail configuration:
  - [ ] API key is valid
  - [ ] Sending domain is verified in SpaceMail
  - [ ] Update API endpoint in `src/lib/emailNotifications.ts` if needed

## ☐ Phase 3: Core Files

These files are already created and ready to use:

- [x] `src/lib/notifications.ts` - Core notification functions
- [x] `src/lib/emailNotifications.ts` - Email sending
- [x] `app/api/notifications/route.ts` - GET notifications
- [x] `app/api/notifications/read/route.ts` - Mark as read
- [x] `app/api/profile/notifications/route.ts` - Update preferences
- [x] `src/components/notification-bell.tsx` - Bell component
- [x] `src/components/notification-settings.tsx` - Settings UI

**Action Items:**
- [ ] Verify all files are in the correct locations
- [ ] Install any missing dependencies (if needed)
- [ ] Check imports resolve correctly

## ☐ Phase 4: UI Integration

### Navigation / Layout

- [ ] Add NotificationBell to your navigation
  - File to edit: `_________________` (fill in your nav file)
  - [ ] Import `NotificationBell` component
  - [ ] Add to navbar (only show when authenticated)
  - [ ] Test that bell icon appears

### Profile / Settings Page

- [ ] Add NotificationSettings to profile page
  - File to edit: `_________________` (fill in your profile page)
  - [ ] Import `NotificationSettings` component
  - [ ] Fetch user's `emailNotificationsEnabled` value
  - [ ] Pass to component as prop
  - [ ] Test toggle on/off

## ☐ Phase 5: Message Notifications Integration

- [ ] Update message creation route
  - File to edit: `_________________` (fill in your messages route)
  - [ ] Import `createMessageNotification`
  - [ ] After creating message, identify recipient
  - [ ] Call `createMessageNotification()` with proper data
  - [ ] Wrap in `.catch()` to handle errors gracefully
  - [ ] Test by sending a message

- [ ] Verify message notifications:
  - [ ] Send message as User A to User B
  - [ ] Log in as User B
  - [ ] Check notification bell shows unread count
  - [ ] Click bell and see message notification
  - [ ] Click notification navigates to conversation

## ☐ Phase 6: Match Notifications Integration

- [ ] Update match generation code
  - File(s) to edit: `_________________` (fill in your match files)
  - [ ] Import `createMatchNotification`
  - [ ] When match is found, call `createMatchNotification()`
  - [ ] Include relevant data (listing IDs, description)
  - [ ] Test by triggering a match

- [ ] Verify match notifications:
  - [ ] Create/update a listing
  - [ ] Trigger match generation
  - [ ] Check notification bell for match notification
  - [ ] Click notification navigates to matches page

## ☐ Phase 7: Testing - In-App Notifications

- [ ] **Test notification creation:**
  - [ ] Send test message
  - [ ] Check database (Prisma Studio) for new Notification record
  - [ ] Verify recipient sees notification in bell dropdown

- [ ] **Test notification bell:**
  - [ ] Unread count displays correctly
  - [ ] Badge shows "9+" when > 9 unread
  - [ ] Clicking bell opens dropdown
  - [ ] Dropdown shows notifications newest first

- [ ] **Test notification dropdown:**
  - [ ] Shows "Loading..." on first load
  - [ ] Shows empty state when no notifications
  - [ ] Shows proper icon and text for MESSAGE type
  - [ ] Shows proper icon and text for MATCH type
  - [ ] Relative time displays correctly ("5 minutes ago")

- [ ] **Test mark as read:**
  - [ ] Click single notification → marks as read
  - [ ] Unread count decreases
  - [ ] Unread indicator (blue dot) disappears
  - [ ] "Mark all as read" button works
  - [ ] All notifications marked as read

- [ ] **Test navigation:**
  - [ ] Clicking MESSAGE notification → navigates to conversation
  - [ ] Clicking MATCH notification → navigates to matches page
  - [ ] Dropdown closes after clicking notification

- [ ] **Test polling:**
  - [ ] Send notification from another browser/user
  - [ ] Wait 30 seconds
  - [ ] Verify bell updates automatically

## ☐ Phase 8: Testing - Email Notifications

- [ ] **Test email opt-in:**
  - [ ] Go to profile/settings
  - [ ] Toggle email notifications ON
  - [ ] Verify setting saved in database
  - [ ] Toggle OFF
  - [ ] Verify setting updated

- [ ] **Test email sending (opt-in user):**
  - [ ] Enable email notifications for test user
  - [ ] Send message to that user
  - [ ] Check email inbox
  - [ ] Verify email received with:
    - [ ] Correct subject line
    - [ ] Sender name in body
    - [ ] Message preview
    - [ ] Link to conversation

- [ ] **Test email NOT sending (opt-out user):**
  - [ ] Disable email notifications for test user
  - [ ] Send message to that user
  - [ ] Verify NO email is sent
  - [ ] Verify in-app notification still created

- [ ] **Test match email:**
  - [ ] Enable email notifications
  - [ ] Trigger a match
  - [ ] Check email inbox
  - [ ] Verify email received with:
    - [ ] Correct subject line
    - [ ] Match description
    - [ ] Link to matches page

- [ ] **Test development override:**
  - [ ] Set `SPACEMAIL_NOTIFICATION_TO_OVERRIDE`
  - [ ] Send notification to any user
  - [ ] Verify email goes to override address
  - [ ] Remove override for production

## ☐ Phase 9: Edge Cases & Error Handling

- [ ] **User sends message to themselves:**
  - [ ] Should NOT create notification

- [ ] **Non-existent user:**
  - [ ] Notification creation fails gracefully
  - [ ] Error logged but doesn't crash

- [ ] **Email sending fails:**
  - [ ] In-app notification still created
  - [ ] Error logged to console
  - [ ] User experience not affected

- [ ] **API errors:**
  - [ ] Unauthenticated user → 401 response
  - [ ] Invalid parameters → 400 response
  - [ ] Server error → 500 response

- [ ] **Network issues:**
  - [ ] Bell shows loading state
  - [ ] Dropdown handles no data gracefully
  - [ ] Retry mechanism works (polling)

## ☐ Phase 10: Production Readiness

- [ ] **Environment variables:**
  - [ ] All required env vars set in production
  - [ ] `SPACEMAIL_NOTIFICATION_TO_OVERRIDE` removed
  - [ ] `NEXT_PUBLIC_APP_URL` set to production URL

- [ ] **Performance:**
  - [ ] Database indexes added correctly
  - [ ] API routes return quickly
  - [ ] Polling interval appropriate (30s is reasonable)

- [ ] **Security:**
  - [ ] All API routes check authentication
  - [ ] Users can only see their own notifications
  - [ ] No sensitive data exposed in notifications

- [ ] **Monitoring:**
  - [ ] Add logging for notification creation
  - [ ] Add logging for email sending
  - [ ] Monitor for errors in production

- [ ] **Documentation:**
  - [ ] Team knows how to use notification system
  - [ ] Integration points documented
  - [ ] Troubleshooting steps available

## ☐ Phase 11: Optional Enhancements

- [ ] Add push notifications
- [ ] Add per-type notification preferences
- [ ] Add email digest (daily/weekly)
- [ ] Add notification retention policy
- [ ] Add real-time updates (WebSocket)
- [ ] Add notification deletion
- [ ] Track which matches already notified (avoid duplicates)

---

## Quick Test Script

Run this after completing integration:

1. **Setup:**
   - Create two test users (User A and User B)
   - Enable email notifications for User B

2. **Test Flow:**
   - Log in as User A
   - Send message to User B
   - Log in as User B
   - Check bell icon (should show unread count)
   - Check email (should receive notification)
   - Click bell dropdown (should see message)
   - Click notification (should go to conversation)
   - Check bell again (should be marked as read)

3. **Expected Results:**
   - ✅ In-app notification created
   - ✅ Email sent to User B
   - ✅ Bell shows unread count
   - ✅ Dropdown shows notification details
   - ✅ Navigation works correctly
   - ✅ Notification marked as read

---

## Status

**Started:** _________

**Completed:** _________

**Notes:**

(Add any notes, issues encountered, or customizations made)
