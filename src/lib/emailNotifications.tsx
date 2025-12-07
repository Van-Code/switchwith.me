/**
 * Email Notification Service
 *
 * Sends notification emails via Resend
 */

import React, { ReactElement, ReactNode } from "react"
import { NotificationType } from "@prisma/client"
import type { MessageNotificationData, MatchNotificationData } from "./notifications"
import MinimalTemplate from "../../react-emails/emails/MinimalTemplate"
import MatchNotification from "../../react-emails/emails/MatchNotification"
import MessageNotification from "../../react-emails/emails/MessageNotification"
import { Resend } from "resend"
import { render } from "@react-email/render"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM = process.env.RESEND_FROM || "support@switchwith.me"
const APP_BASE_URL = process.env.NEXTAUTH_URL || "https://switchwith.me"

const resend = new Resend(RESEND_API_KEY)

interface EmailPayload {
  to: string
  userName: string
  type: NotificationType
  data: MessageNotificationData | MatchNotificationData
}

function buildReactTemplate({
  type,
  userName,
  url,
  data,
  description,
}: {
  type: NotificationType
  userName: string
  url: string
  data?: MessageNotificationData | MatchNotificationData,
  description?: string
}): React.ReactNode {
  switch (type) {
    case NotificationType.MESSAGE:
      return <MessageNotification userName={userName} url={url} />

    case NotificationType.MATCH:
      return <MatchNotification userName={userName} url={url} description={description}/>

    default:
      return <MinimalTemplate userName={userName} url={url} />
  }
}

export async function sendNotificationEmail({
  to,
  userName,
  type,
  data,
}: EmailPayload): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email")
    return
  }

  const subject =
    type === NotificationType.MESSAGE
      ? "New message on Switch With Me"
      : "You have a new seat match suggestion!"

  const url = buildEmailUrl(type, data)
  const reactTemplate = buildReactTemplate({ type, userName, data, url })

  // Render React -> HTML / text
  const html = await render(reactTemplate)
  const text = await render(reactTemplate, { plainText: true })

  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: [to],
      subject,
      html,
      text,
    })
  
    console.log(`Notification email sent to ${to} (type: ${type})`)
  } catch (err) {
      console.error("Failed to send notification email:", err)
      throw(err)
  }
}

function buildEmailUrl(
  type: NotificationType,
  data: MessageNotificationData | MatchNotificationData
): string {
  switch (type) {
    case NotificationType.MESSAGE:
      return `${APP_BASE_URL}/conversations/${(data as MessageNotificationData).conversationId}`
    case NotificationType.MATCH:
      return `${APP_BASE_URL}/matches`
    default:
      return `${APP_BASE_URL}/messages`
  }
}
