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
 * Builds the ultra-minimal spam-proof SIEC certificate notification email.
 * No images, no gradients, no buttons, no emojis — plain inline-linked text only.
 */
export function buildCertificateEmailHtml({
  recipient,
  eventId,
  eventName,
  portalBaseUrl,
}: SendCertificateEmailParams): string {
  const participantName = recipient.name || "Valued Participant";
  const role = recipient.role || "Participant";
  const certificateUrl = `${portalBaseUrl.replace(/\/$/, "")}/?event=${encodeURIComponent(
    eventId
  )}&email=${encodeURIComponent(recipient.email)}`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #222222; line-height: 1.5; padding: 20px;">
  <!-- Event Heading -->
        <h1 style="font-size: 100px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 20px; text-align: center;">
          ${eventName}
        </h1>

        <!-- Participant Message -->
        <p style="font-size: 28px; color: #334155; margin-bottom: 16px;">
          Hello ${participantName},
        </p>

        <p style="font-size: 24px; color: #475569; margin-bottom: 20px;">
          Congratulations on your contribution as <strong>${role}</strong> in <strong>${eventName}</strong>.
        </p>

        <!-- Direct Certificate Link -->
        <p style="font-size: 32px; color: #475569; margin-bottom: 24px;">
          Your official participation <a href="${certificateUrl}" style="color: #2563eb; text-decoration: underline; font-weight: bold;">Certificate</a> is now live and ready to view on the portal.
        </p>

        <!-- Social / Tagging CTA -->
        <p style="font-size: 20px; color: #334155; margin: 0;">
          Sharing your achievement on social media? Be sure to tag <a href="https://www.linkedin.com/company/siec-community/" style="color: #0284c7; font-weight: bold; text-decoration: none;">SIEC Community</a> on LinkedIn so we can re-share and celebrate your accomplishment!
        </p>
</body>
</html>`.trim();
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
