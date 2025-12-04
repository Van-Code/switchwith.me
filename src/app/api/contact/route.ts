import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM = process.env.RESEND_FROM || "support@switchwith.me"
const APP_BASE_URL = process.env.NEXTAUTH_URL || "https://switchwith.me"

const resend = new Resend(RESEND_API_KEY)
interface ContactFormData {
  name: string
  email: string
  subject?: string
  message: string
  website?: string // honeypot field
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()

    // Honeypot check: if 'website' field is filled, it's likely spam
    // Silently accept but don't process
    if (body.website && body.website.trim() !== "") {
      console.log("Spam detected via honeypot field")
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "Message is missing required fields." },
        { status: 400 }
      )
    }

    if (
      body.name.trim() === "" ||
      body.email.trim() === "" ||
      body.message.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Message is missing required fields." },
        { status: 400 }
      )
    }

    if (!RESEND_API_KEY || !RESEND_FROM) {
      console.error("SpaceMail environment variables are not configured")
      return NextResponse.json(
        { error: "Email service is not configured. Please try again later." },
        { status: 500 }
      )
    }

    // Build email subject
    const emailSubject = body.subject
      ? `Contact Form: ${body.subject}`
      : `New contact form message from ${body.name}`

    // Build email body
    const emailBody = `
You have received a new message from the contact form:/n
Name: ${body.name}/n
Email: ${body.email}/n
${body.subject ? `Subject: ${body.subject}` : ""}/n
Message:
${body.message}/n
---
Sent at: ${new Date().toISOString()}
    `.trim()

    const { data: response, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: [RESEND_FROM],
      subject: emailSubject,
      html: emailBody,
      replyTo: body.email,
    })
    if (error) {
      throw new Error(
        `Resend API error: ${error.statusCode} ${error.name} - ${error.message}`
      )
    }
    console.log(`Contact form message sent from ${body.email}`)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error("Error processing contact form:", err)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    )
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
