import { NextRequest, NextResponse } from "next/server";
import {
  sendSingleCertificateEmail,
  type CertificateEmailRecipient,
} from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, eventName, recipients, portalBaseUrl, adminEmail } = body;

    if (!eventId || !eventName) {
      return NextResponse.json(
        { error: "Event ID and Event Name are required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "A non-empty list of recipients is required." },
        { status: 400 }
      );
    }

    // Determine the base URL for certificate claim links
    const origin =
      portalBaseUrl ||
      req.headers.get("origin") ||
      req.headers.get("referer") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:4000";

    const cleanBaseUrl = origin.replace(/\/$/, "");

    let delivered = 0;
    let failed = 0;
    let isSimulated = false;
    const results: Array<{
      email: string;
      name: string;
      status: "delivered" | "failed";
      error?: string;
    }> = [];

    // Process recipients
    for (const recipient of recipients as CertificateEmailRecipient[]) {
      const email = recipient.email ? recipient.email.trim() : "";
      const name = recipient.name ? recipient.name.trim() : "Participant";

      if (!email || !email.includes("@")) {
        failed++;
        results.push({
          email: email || "(missing email)",
          name,
          status: "failed",
          error: "Invalid email address format",
        });
        continue;
      }

      const outcome = await sendSingleCertificateEmail({
        recipient: { name, email },
        eventId,
        eventName,
        portalBaseUrl: cleanBaseUrl,
        adminEmail,
      });

      if (outcome.simulated) {
        isSimulated = true;
      }

      if (outcome.success) {
        delivered++;
        results.push({
          email,
          name,
          status: "delivered",
        });
      } else {
        failed++;
        results.push({
          email,
          name,
          status: "failed",
          error: outcome.error,
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: recipients.length,
      delivered,
      failed,
      simulated: isSimulated,
      results,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("API send-certificates error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error occurred while sending emails." },
      { status: 500 }
    );
  }
}
