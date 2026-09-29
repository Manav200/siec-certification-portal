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
  <title>Your E-Certificate is Ready | SIEC</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1E293B;">

  <!-- Outer Table Wrapper -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 40px 10px;">
    <tr>
      <td align="center">

        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);">

          <!-- Ocean Gradient Header -->
          <tr>
            <td style="background: #06B6D4; background: linear-gradient(135deg, #06B6D4 0%, #1D4ED8 100%); padding: 36px 24px; text-align: center;">
              <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">
                SIEC | STUDENT INDUSTRY ENGAGEMENT COMMUNITY
              </h1>
              <p style="color: #E0F2FE; font-size: 12px; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                Official E-Certificate Portal
              </p>
            </td>
          </tr>

          <!-- Warm Gradient Divider Bar -->
          <tr>
            <td style="height: 4px; background: #FFC837; background: linear-gradient(90deg, #FFC837 0%, #FF8008 100%);"></td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #0F172A; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">
                Congratulations, ${participantName}! 🎉
              </h2>

              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                We are excited to announce that your official E-Certificate for <strong>${eventName}</strong> has been issued and is now ready for collection!
              </p>

              <!-- Event Details Info Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F1F5F9; border-left: 4px solid #7C3AED; border-radius: 6px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">
                      <strong>Event:</strong> ${eventName}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #334155;">
                      <strong>Registered Email:</strong> ${recipient.email}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Button (Purple-Teal Gradient) -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${claimUrl}" target="_blank" style="display: inline-block; background: #7C3AED; background: linear-gradient(135deg, #7C3AED 0%, #10B981 100%); color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      Claim &amp; Download Certificate
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Features Section -->
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
                <strong>On the portal, you can:</strong>
              </p>
              <ul style="color: #475569; font-size: 14px; line-height: 1.8; margin-top: 0; padding-left: 20px; margin-bottom: 32px;">
                <li>Download high-resolution <strong>PNG</strong> or <strong>PDF</strong> formats.</li>
                <li>Add this certificate directly to your <strong>LinkedIn Profile</strong> certification section in one click.</li>
              </ul>

              <hr style="border: none; border-top: 1px solid #E2E8F0; margin-bottom: 24px;">

              <!-- Fallback Direct Link -->
              <p style="color: #64748B; font-size: 12px; line-height: 1.5; margin: 0;">
                If the button above doesn't work, copy and paste this URL into your browser:<br>
                <a href="${claimUrl}" style="color: #06B6D4; word-break: break-all; text-decoration: underline;">${claimUrl}</a>
              </p>

              ${adminEmail ? `
              <div style="margin-top: 24px; padding: 14px 16px; background-color: #F1F5F9; border-left: 4px solid #06B6D4; border-radius: 6px; font-size: 12px; color: #475569; line-height: 1.5;">
                <strong style="color: #0F172A;">Issued by Event Administrator:</strong> <span style="font-family: monospace;">${adminEmail}</span><br>
                For queries regarding this certification, you can reply directly to this email.
              </div>
              ` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 24px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #475569; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">
                Student Industry Engagement Community (SIEC)${adminEmail ? ` • Admin: ${adminEmail}` : ""}
              </p>
              <p style="color: #94A3B8; font-size: 12px; margin: 0;">
                Empowering students through industry exposure and practical engagement.
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
