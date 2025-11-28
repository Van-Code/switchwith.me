import { NextRequest, NextResponse } from "next/server"

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

    // Get SpaceMail configuration from environment variables
    const spaceMailApiKey = process.env.SPACEMAIL_API_KEY
    const spaceMailFrom = process.env.SPACEMAIL_FROM
    const spaceMailTo = process.env.SPACEMAIL_TO

    if (!spaceMailApiKey || !spaceMailFrom || !spaceMailTo) {
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
You have received a new message from the contact form:
Name: ${body.name}
Email: ${body.email}
${body.subject ? `Subject: ${body.subject}` : ""}
Message:
${body.message}
---
Sent at: ${new Date().toISOString()}
    `.trim()

    // Send email via SpaceMail API
    // NOTE: Adjust the API endpoint and request structure based on SpaceMail's actual documentation
    // This is a generic implementation that should work with most transactional email APIs
    const spaceMailResponse = await fetch("https://api.spacemail.com/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use whichever auth header SpaceMail requires:
        // Option 1: Bearer token
        Authorization: `Bearer ${spaceMailApiKey}`,
        // Option 2: Custom header (uncomment if needed)
        // "X-API-Key": spaceMailApiKey,
      },
      body: JSON.stringify({
        from: spaceMailFrom,
        to: spaceMailTo,
        subject: emailSubject,
        text: emailBody,
        // If SpaceMail supports HTML, you can add an html field:
        // html: `<p><strong>Name:</strong> ${body.name}</p>...`,
      }),
    })

    if (!spaceMailResponse.ok) {
      const errorText = await spaceMailResponse.text()
      console.error("SpaceMail API error:", spaceMailResponse.status, errorText)
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      )
    }

    console.log(`Contact form message sent from ${body.email}`)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    )
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}