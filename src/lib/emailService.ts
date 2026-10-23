import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

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
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate Access - ${eventName}</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.6;">
    <div style="background-color: #f8fafc; padding: 20px 10px; font-family: Arial, Helvetica, sans-serif;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- SIEC Community Header Logo -->
        <img src="cid:siec-horizontal-logo" alt="SIEC Community Logo" width="440" style="display: block; margin: 0 auto 24px; max-width: 100%; width: 440px; height: auto; border: 0; outline: none; text-decoration: none;">
            
        <!-- Event Heading -->
        <h1 style="font-size: 36px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; text-align: center; line-height: 1.3; font-family: Arial, Helvetica, sans-serif; letter-spacing: -0.5px;">
          ${eventName}
        </h1>

        <!-- Participant Message -->
        <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px; line-height: 1.4; font-family: Arial, Helvetica, sans-serif;">
          Dear ${participantName},
        </p>

        <p style="font-size: 16px; color: #475569; margin-bottom: 12px; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
            Thank you for your contribution as 
          <span style="background-color: #eff6ff; color: #1d4ed8; font-weight: 600; padding: 3px 10px; border-radius: 20px; border: 1px solid #bfdbfe; font-size: 14px; display: inline-block;">${role}</span> 
          in the <strong style="color: #0f172a;">${eventName}</strong>.
          <br>We are pleased to announce that your official E-Certificate is now ready for the redemption thorough our Official Portal.
          <br><strong style="color: #0f172a;">How to Download Your Certificate:</strong>
        </p>
        <ol>
          <li><strong style="color: #000000;">Visit the Portal: </strong>Go to the Official <a href="https://siec-certification-portal.vercel.app/" style="color: #2563eb; font-weight: bold; text-decoration: underline;">SIEC E-Certification Portal</a>.</li>
          <li><strong style="color: #000000;">Select Event: </strong>Choose ${eventName} from the dropdown menu.</li>
          <li><strong style="color: #000000;">Enter your Registered Email: </strong>Enter your email address.</li>
          <li><strong style="color: #000000;">Download Certificate: </strong>Preview your Certificate and download it in your Preferred Format (PNG/PDF) or You can directly Upload it on your LinkedIn Profile.</li>
        </ol>

        <!-- Direct Certificate Link -->
        <p style="font-size: 16px; color: #475569; margin-bottom: 12px; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
          Direct Link to Your <a href="${certificateUrl}" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Certificate</a>.
        </p>

        <!-- Social / Tagging CTA -->
        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; font-family: Arial, Helvetica, sans-serif;">
          <p style="font-size: 16px; color: #0369a1; margin: 0; line-height: 1.5;">
            Sharing your achievement on social media? Be sure to tag <a href="https://www.linkedin.com/company/siec-community/" style="color: #0284c7; font-weight: bold; text-decoration: underline;">SIEC Community</a> on LinkedIn so we can re-share and celebrate your accomplishment!
          </p>
        </div>
      </div>
    </div>
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
    const logoPath = path.join(process.cwd(), "public", "SIEC Horizontal.png");
    const attachments = fs.existsSync(logoPath)
      ? [
        {
          filename: "SIEC Horizontal.png",
          path: logoPath,
          cid: "siec-horizontal-logo",
        },
      ]
      : [];

    const info = await transporter.sendMail({
      from,
      replyTo,
      to: `"${params.recipient.name || "Participant"}" <${params.recipient.email}>`,
      subject,
      html,
      attachments,
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
