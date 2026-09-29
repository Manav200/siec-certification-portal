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
  <title>Your SIEC E-Certificate is Ready!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F8FAFC;
      padding: 32px 16px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid #E2E8F0;
    }
    .header-bar {
      background: linear-gradient(135deg, #06B6D4 0%, #2563EB 50%, #1D4ED8 100%);
      padding: 36px 32px;
      text-align: center;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      padding: 10px 20px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      margin-bottom: 12px;
    }
    .logo-text {
      color: #FFFFFF;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 2px;
      margin: 0;
    }
    .header-title {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 800;
      margin: 8px 0 0 0;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .paragraph {
      font-size: 15px;
      line-height: 1.65;
      color: #475569;
      margin: 0 0 20px 0;
    }
    .event-card {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 12px;
      padding: 18px 20px;
      margin: 24px 0;
    }
    .event-card-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #166534;
      margin-bottom: 4px;
    }
    .event-card-title {
      font-size: 17px;
      font-weight: 800;
      color: #14532D;
      margin: 0;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 28px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #06B6D4 0%, #1D4ED8 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 14px 0 rgba(6, 182, 212, 0.39);
      letter-spacing: 0.2px;
    }
    .instructions-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .instructions-title {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
    }
    .instructions-text {
      font-size: 13px;
      line-height: 1.6;
      color: #64748B;
      margin: 0;
    }
    .footer {
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 24px 32px;
      text-align: center;
    }
    .footer-org {
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      margin: 0 0 6px 0;
    }
    .footer-note {
      font-size: 11px;
      color: #94A3B8;
      margin: 0;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Ocean Gradient Header Bar -->
      <div class="header-bar">
        <div class="logo-badge">
          <p class="logo-text">SIEC CERTIFICATION</p>
        </div>
        <h1 class="header-title">Official E-Certificate Ready</h1>
      </div>

      <!-- Main Body Content -->
      <div class="content">
        <p class="greeting">Dear ${participantName},</p>
        
        <p class="paragraph">
          Congratulations on successfully participating in <strong>${eventName}</strong>! We are thrilled to recognize your dedication, participation, and accomplishments. Your official verified e-certificate has been issued and is ready for download.
        </p>

        <!-- Event Highlight Card -->
        <div class="event-card">
          <div class="event-card-label">Certified Event</div>
          <p class="event-card-title">${eventName}</p>
        </div>

        <!-- Highlighted Action CTA Button -->
        <div class="cta-container">
          <a href="${claimUrl}" class="cta-button" target="_blank" rel="noopener noreferrer">
            Claim &amp; Download Your Certificate →
          </a>
        </div>

        <!-- Instructions -->
        <div class="instructions-box">
          <p class="instructions-title">💡 How to Access &amp; Share:</p>
          <p class="instructions-text">
            Enter your registered email address (<strong>${recipient.email}</strong>) on the portal to preview your certificate, download in high-resolution <strong>PNG / PDF</strong>, or add directly to your <strong>LinkedIn Profile</strong> credentials with one click.
          </p>
        </div>

        <p class="paragraph" style="margin-bottom: 0; font-size: 13px; color: #64748B;">
          If the button above does not work, copy and paste this verification URL into your browser:<br>
          <a href="${claimUrl}" style="color: #0284C7; word-break: break-all;">${claimUrl}</a>
        </p>

        ${
          adminEmail
            ? `
        <div style="margin-top: 24px; padding: 14px 16px; background-color: #F1F5F9; border-left: 4px solid #06B6D4; border-radius: 6px; font-size: 12px; color: #475569; line-height: 1.5;">
          <strong style="color: #0F172A;">Issued by Event Administrator:</strong> <span style="font-family: monospace;">${adminEmail}</span><br>
          For queries regarding this certification, you can reply directly to this email.
        </div>
        `
            : ""
        }
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-org">Organized by Student Industry Engagement Community (SIEC)${
          adminEmail ? ` • Admin: ${adminEmail}` : ""
        }</p>
        <p class="footer-note">
          Official notification from SIEC Certification Portal.
        </p>
      </div>
    </div>
  </div>
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
