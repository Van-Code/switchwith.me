/**
 * Email Notification Service
 *
 * Sends notification emails via SpaceMail
 */

import { NotificationType } from "@prisma/client"
import type { MessageNotificationData, MatchNotificationData } from "./notifications"

const SPACEMAIL_API_KEY = process.env.SPACEMAIL_API_KEY
const SPACEMAIL_FROM = process.env.SPACEMAIL_FROM || "notifications@switchwith.me"
const SPACEMAIL_NOTIFICATION_TO_OVERRIDE = process.env.SPACEMAIL_NOTIFICATION_TO_OVERRIDE
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://switchwith.me"

// SpaceMail API endpoint - adjust this to match SpaceMail's actual API
// Check SpaceMail docs at https://spacemail.com/docs for the correct endpoint
const SPACEMAIL_API_URL = "https://api.spacemail.com/v1/send"

interface EmailPayload {
  to: string
  userName: string
  type: NotificationType
  data: MessageNotificationData | MatchNotificationData
}

/**
 * Sends a notification email via SpaceMail
 */
export async function sendNotificationEmail({
  to,
  userName,
  type,
  data
}: EmailPayload): Promise<void> {
  if (!SPACEMAIL_API_KEY) {
    console.warn("SPACEMAIL_API_KEY not configured, skipping email notification")
    return
  }

  // Use override email for development/testing if configured
  const recipientEmail = SPACEMAIL_NOTIFICATION_TO_OVERRIDE || to

  const { subject, text } = buildEmailContent({ userName, type, data })

  try {
    const response = await fetch(SPACEMAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SPACEMAIL_API_KEY}`
        // Adjust headers based on SpaceMail's actual API requirements
      },
      body: JSON.stringify({
        from: SPACEMAIL_FROM,
        to: recipientEmail,
        subject,
        text
        // If SpaceMail supports HTML emails, you can add:
        // html: buildHtmlEmail({ userName, type, data }),
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `SpaceMail API error: ${response.status} ${response.statusText} - ${errorText}`
      )
    }

    console.log(`Notification email sent to ${recipientEmail} (type: ${type})`)
  } catch (error) {
    console.error("Failed to send notification email:", error)
    throw error
  }
}

/**
 * Builds email subject and body based on notification type
 */
function buildEmailContent({
  userName,
  type,
  data
}: {
  userName: string
  type: NotificationType
  data: MessageNotificationData | MatchNotificationData
}): { subject: string; text: string } {
  switch (type) {
    case "MESSAGE":
      return buildMessageEmail(userName, data as MessageNotificationData)
    case "MATCH":
      return buildMatchEmail(userName, data as MatchNotificationData)
    default:
      return {
        subject: "New notification on Switch With Me",
        text: `Hi ${userName},\n\nYou have a new notification on Switch With Me.\n\nView it here: ${APP_BASE_URL}\n\nThanks,\nThe Switch With Me Team`
      }
  }
}

/**
 * Builds email for new message notification
 */
function buildMessageEmail(
  userName: string,
  data: MessageNotificationData
): { subject: string; text: string } {
  const conversationUrl = `${APP_BASE_URL}/conversations/${data.conversationId}`

  const subject = "New message on Switch With Me"

  const text = `Hi ${userName},

${data.senderName} sent you a message:

"${data.preview}"

Reply here: ${conversationUrl}

Thanks,
The Switch With Me Team

---
To turn off email notifications, visit ${APP_BASE_URL}/profile`

  return { subject, text }
}

/**
 * Builds email for new match notification
 */
function buildMatchEmail(
  userName: string,
  data: MatchNotificationData
): { subject: string; text: string } {
  const matchesUrl = `${APP_BASE_URL}/matches`

  const subject = "You have a new seat match suggestion!"

  const text = `Hi ${userName},

Great news! We found a potential match for your seat swap.

${data.description || "Someone is looking for what you have and has what you need!"}

View your matches here: ${matchesUrl}

Don't wait too long—good matches go fast!

Thanks,
The Switch With Me Team

---
To turn off email notifications, visit ${APP_BASE_URL}/profile`

  return { subject, text }
}

/**
 * Optional: Build HTML email for better formatting
 * Uncomment and use if SpaceMail supports HTML emails
 */
/*
function buildHtmlEmail({
  userName,
  type,
  data,
}: {
  userName: string;
  type: NotificationType;
  data: MessageNotificationData | MatchNotificationData;
}): string {
  const { text } = buildEmailContent({ userName, type, data });

  // Basic HTML wrapper - you can make this fancier with proper email templates
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${text.split('\n').map(line => `<p>${line}</p>`).join('')}
      </body>
    </html>
  `;
}
*/
