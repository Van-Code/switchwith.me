/**
 * Email Notification Service
 *
 * Sends notification emails via Resend
 */

import { NotificationType } from "@prisma/client"
import type { MessageNotificationData, MatchNotificationData } from "./notifications"
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM = process.env.RESEND_FROM || "support@switchwith.me"
const APP_BASE_URL = process.env.NEXTAUTH_URL || "https://switchwith.me"

const resend = new Resend(RESEND_API_KEY);

interface EmailPayload {
  to: string
  userName: string
  type: NotificationType
  data: MessageNotificationData | MatchNotificationData
}

/**
 * Sends a notification email via Resend
 */
export async function sendNotificationEmail({
  to,
  userName,
  type,
  data
}: EmailPayload): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email notification")
    return
  }

  // Use override email for development/testing if configured
  const recipientEmail = to
  const { subject, text } = buildEmailContent({ userName, type, data })

  try {
    const {data:response, error} = await resend.emails.send({
        from: RESEND_FROM,
        to: [recipientEmail],
        subject,
        html: buildHtmlEmail({ userName, type, data }),
        //text
    })
    if (error) {
      throw new Error(
        `Resend API error: ${error.statusCode} ${error.name} - ${error.message}`
      )
    }

    console.log(`Notification email sent to ${recipientEmail} (type: ${type})`)
  } catch (err) {
    console.error("Failed to send notification email:", err)
    throw err
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