import nodemailer from "nodemailer";

export interface CertificateEmailRecipient {
  name: string;
  email: string;
  role?: string;
}

export interface SendCertificateEmailParams {
  recipient: CertificateEmailRecipient;
  eventId: string;
  eventName: string;
  portalBaseUrl: string;
  adminEmail?: string;
}

/**
 * Builds the official SIEC responsive HTML email template
 */
export function buildCertificateEmailHtml({
  recipient,
  eventId,
  eventName,
  portalBaseUrl,
  adminEmail,
}: SendCertificateEmailParams): string {
  const participantName = recipient.name || "Valued Participant";
  const claimUrl = `${portalBaseUrl.replace(/\/$/, "")}/?event=${encodeURIComponent(
    eventId
  )}&email=${encodeURIComponent(recipient.email)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate Access - SIEC</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif; color: #333333;">

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 30px 10px;">
    <tr>
      <td align="center">

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">

          <!-- Solid Header -->
          <tr>
            <td style="background-color: #1d4ed8; padding: 24px; text-align: left;">
              <span style="color: #ffffff; font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">
                Student Industry Engagement Community (SIEC)
              </span>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px 24px;">
              <p style="font-size: 15px; color: #333333; margin-top: 0; margin-bottom: 16px;">
                Hello ${participantName},
              </p>

              <p style="font-size: 14px; color: #4a5568; line-height: 1.5; margin-bottom: 20px;">
                Your participation certificate for <strong>${eventName}</strong> is now available on the official SIEC portal.
              </p>

              <!-- Info Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; color: #4a5568;">
                      <strong>Event:</strong> ${eventName}
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #4a5568;">
                      <strong>Registered Email:</strong> ${recipient.email}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="left">
                    <a href="${claimUrl}" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
                      Access Certificate
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #718096; line-height: 1.5; margin-bottom: 0;">
                Through the portal, you can download your document in PNG or PDF format, or link it directly to your LinkedIn profile credentials.
              </p>

              ${adminEmail ? `
              <div style="margin-top: 20px; padding: 12px 14px; background-color: #f8fafc; border-left: 3px solid #1d4ed8; border-radius: 4px; font-size: 12px; color: #4a5568; line-height: 1.5;">
                <strong>Issued by:</strong> ${adminEmail}<br>
                For any queries, you may reply directly to this email.
              </div>
              ` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 24px; text-align: left; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 12px; margin: 0 0 4px 0;">
                Student Industry Engagement Community (SIEC)${adminEmail ? ` • ${adminEmail}` : ""}
              </p>
              <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                This is an automated operational email regarding your event participation record.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

/**
 * Creates the appropriate Nodemailer transporter
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true";

  if (host && user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      }),
      isConfigured: true,
    };
  }

  return {
    transporter: null,
    isConfigured: false,
  };
}

/**
 * Sends a single certificate notification email
 */
export async function sendSingleCertificateEmail(
  params: SendCertificateEmailParams
): Promise<{ success: boolean; simulated: boolean; messageId?: string; error?: string }> {
  const { transporter, isConfigured } = createTransporter();
  const subject = `Your E-Certificate for ${params.eventName} is Ready! | SIEC`;

  const senderName = "Student Industry Engagement Community (SIEC)";
  // Use creating admin's email as sender/reply-to
  const adminEmail = params.adminEmail ? params.adminEmail.trim() : null;
  const defaultFrom =
    process.env.SMTP_FROM ||
    (process.env.SMTP_USER
      ? `"${senderName}" <${process.env.SMTP_USER}>`
      : `"${senderName}" <teamskillsetu@gitmgurgaon.com>`);

  const from = adminEmail ? `"${senderName} (${adminEmail})" <${adminEmail}>` : defaultFrom;
  const replyTo = adminEmail ? `"${senderName}" <${adminEmail}>` : undefined;

  const html = buildCertificateEmailHtml(params);

  if (!isConfigured || !transporter) {
    // Graceful simulation mode for development/testing when SMTP credentials are not yet set
    console.log(
      `[SIEC Email Simulator] Simulated email from admin [${adminEmail || "Default"}] to: ${params.recipient.email} for event: ${params.eventName}`
    );
    return {
      success: true,
      simulated: true,
      messageId: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  try {
    const info = await transporter.sendMail({
      from,
      replyTo,
      to: `"${params.recipient.name || "Participant"}" <${params.recipient.email}>`,
      subject,
      html,
    });

    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[SIEC Email Error] Failed to send to ${params.recipient.email}:`, err);
    return {
      success: false,
      simulated: false,
      error: err.message || "Failed to deliver email",
    };
  }
}
