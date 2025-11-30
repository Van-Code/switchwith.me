/**
 * Password Reset Email Service
 *
 * Sends password reset emails via SpaceMail
 */

const SPACEMAIL_API_KEY = process.env.SPACEMAIL_API_KEY;
const SPACEMAIL_FROM = process.env.SPACEMAIL_FROM || "notifications@valkyriesswap.com";
const SPACEMAIL_NOTIFICATION_TO_OVERRIDE = process.env.SPACEMAIL_NOTIFICATION_TO_OVERRIDE;
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://valkyriesswap.com";

// SpaceMail API endpoint
const SPACEMAIL_API_URL = "https://api.spacemail.com/v1/send";

interface PasswordResetEmailPayload {
  to: string;
  userName: string;
  token: string;
}

/**
 * Sends a password reset email via SpaceMail
 */
export async function sendPasswordResetEmail({
  to,
  userName,
  token,
}: PasswordResetEmailPayload): Promise<void> {
  if (!SPACEMAIL_API_KEY) {
    console.warn("SPACEMAIL_API_KEY not configured, skipping password reset email");
    return;
  }

  // Use override email for development/testing if configured
  const recipientEmail = SPACEMAIL_NOTIFICATION_TO_OVERRIDE || to;

  const resetUrl = `${APP_BASE_URL}/auth/reset-password?token=${token}`;

  const subject = "Reset your Switch With Me password";

  const text = `Hi ${userName},

We received a request to reset your password for your Switch With Me account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Thanks,
The Switch With Me Team

---
If you're having trouble clicking the link, copy and paste this URL into your browser:
${resetUrl}`;

  try {
    const response = await fetch(SPACEMAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SPACEMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        from: SPACEMAIL_FROM,
        to: recipientEmail,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `SpaceMail API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    console.log(`Password reset email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}
