"use client";

import React, { useState } from "react";
import type { CertificateEvent, CsvRow } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface PublishCampaignModalProps {
  isOpen: boolean;
  event: CertificateEvent;
  csvRows: CsvRow[];
  onCloseAction: () => void;
  onSuccessAction: () => void;
}

interface DeliveryRecord {
  name: string;
  email: string;
  status: "delivered" | "failed";
  error?: string;
}

export default function PublishCampaignModal({
  isOpen,
  event,
  csvRows,
  onCloseAction,
  onSuccessAction,
}: PublishCampaignModalProps) {
  const { user } = useAuth();
  const adminEmail = event.creatorEmail || user?.email || "";

  const [sendEmails, setSendEmails] = useState(true);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [step, setStep] = useState<"confirm" | "dispatching" | "completed">("confirm");
  const [progressText, setProgressText] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [deliveryRecords, setDeliveryRecords] = useState<DeliveryRecord[]>([]);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);
  const [showDetailedLog, setShowDetailedLog] = useState(false);

  if (!isOpen) return null;

  // Extract recipient email and name from row data
  const emailKeys = [
    "email",
    "Email",
    "EMAIL",
    "Email Address",
    "email address",
    "Email ID",
    "email id",
    "Mail ID",
    "mail id",
    "Mail",
    "mail",
  ];
  const nameKeys = [
    "name",
    "Name",
    "NAME",
    "Participant Name",
    "participant name",
    "Full Name",
    "full name",
  ];

  const parsedRecipients = csvRows.map((row) => {
    let email = "";
    for (const k of emailKeys) {
      if (row[k] && String(row[k]).trim() !== "") {
        email = String(row[k]).trim();
        break;
      }
    }

    let name = "Participant";
    for (const k of nameKeys) {
      if (row[k] && String(row[k]).trim() !== "") {
        name = String(row[k]).trim();
        break;
      }
    }

    return { name, email, role: row.role || row.Role || "Participant" };
  });

  const validRecipients = parsedRecipients.filter(
    (r) => r.email && r.email.includes("@")
  );

  const totalRecipients = csvRows.length;

  const handleStartPublish = async () => {
    // If not sending emails, proceed directly
    if (!sendEmails || validRecipients.length === 0) {
      setStep("completed");
      setDeliveredCount(0);
      setFailedCount(0);
      return;
    }

    setStep("dispatching");
    setProgressPercent(5);
    setProgressText(`Preparing ${validRecipients.length} notification emails...`);

    const BATCH_SIZE = 10;
    let currentDelivered = 0;
    let currentFailed = 0;
    let simulatedFlag = false;
    const allRecords: DeliveryRecord[] = [];

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://siec-portal.vercel.app";

    for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
      const chunk = validRecipients.slice(i, i + BATCH_SIZE);
      const currentProcessed = Math.min(i + chunk.length, validRecipients.length);

      setProgressText(
        `Sending ${currentProcessed} of ${validRecipients.length} notification emails...`
      );
      setProgressPercent(
        Math.round((currentProcessed / validRecipients.length) * 100)
      );

      try {
        const res = await fetch("/api/send-certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            eventName: event.eventName,
            recipients: chunk,
            portalBaseUrl: origin,
            adminEmail,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          currentDelivered += data.delivered || 0;
          currentFailed += data.failed || 0;
          if (data.simulated) simulatedFlag = true;

          if (Array.isArray(data.results)) {
            allRecords.push(...data.results);
          }
        } else {
          currentFailed += chunk.length;
          chunk.forEach((r) => {
            allRecords.push({
              name: r.name,
              email: r.email,
              status: "failed",
              error: `HTTP error ${res.status}`,
            });
          });
        }
      } catch (err) {
        currentFailed += chunk.length;
        chunk.forEach((r) => {
          allRecords.push({
            name: r.name,
            email: r.email,
            status: "failed",
            error: "Network dispatch error",
          });
        });
      }

      // Small throttle between batches for realistic progress rendering
      if (i + BATCH_SIZE < validRecipients.length) {
        await new Promise((res) => setTimeout(res, 300));
      }
    }

    setDeliveredCount(currentDelivered);
    setFailedCount(currentFailed);
    setIsSimulated(simulatedFlag);
    setDeliveryRecords(allRecords);
    setStep("completed");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={step === "dispatching" ? undefined : onCloseAction}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/40 bg-white p-6 shadow-2xl backdrop-blur-xl animate-scale-in z-10 max-h-[90vh] flex flex-col">
        {/* ============================================================== */}
        {/* STEP 1: CONFIRM PUBLISH & EMAIL TOGGLE */}
        {/* ============================================================== */}
        {step === "confirm" && (
          <div className="space-y-5 overflow-y-auto pr-1">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">
                  Publish Campaign &amp; Issue Certificates
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Publish this event to the public verification portal and optionally notify participants.
                </p>
              </div>
            </div>

            {/* Event Summary Card */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Event Name:</span>
                <span className="font-bold text-gray-900">{event.eventName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Category:</span>
                <span className="font-semibold text-gray-800">{event.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Participants Parsed:</span>
                <span className="font-semibold text-blue-700">
                  {totalRecipients} Total ({validRecipients.length} with valid email)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Sender / Issuing Admin:</span>
                <span className="font-semibold text-cyan-800 font-mono">
                  {adminEmail || "Default Mailer"}
                </span>
              </div>
            </div>

            {/* Automated Email Toggle Option */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 transition-all">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendEmails}
                  onChange={(e) => setSendEmails(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  id="toggle-send-emails-checkbox"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">
                      Send Email Notifications to Participants
                    </span>
                    <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-800">
                      Automated
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    Sends an official branded SIEC certificate notification email with personalized claim links and LinkedIn instructions to all {validRecipients.length} recipients.
                  </p>
                </div>
              </label>

              {/* Collapsible Email Template Preview */}
              {sendEmails && (
                <div className="mt-3 border-t border-gray-200/80 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-800 transition-colors"
                  >
                    <span>{showEmailPreview ? "▼ Hide" : "▶ Preview"} Email Template</span>
                  </button>

                  {showEmailPreview && (
                    <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3.5 text-xs shadow-sm space-y-2">
                      <div className="text-[11px] text-gray-400">
                        <strong className="text-gray-600">From / Sender:</strong> Student Industry Engagement Community (SIEC) &lt;{adminEmail || "teamskillsetu@gitmgurgaon.com"}&gt;
                      </div>
                      {adminEmail && (
                        <div className="text-[11px] text-gray-400">
                          <strong className="text-gray-600">Reply-To:</strong> {adminEmail}
                        </div>
                      )}
                      <div className="text-[11px] text-gray-400">
                        <strong className="text-gray-600">Subject:</strong> Your E-Certificate for {event.eventName} is Ready! | SIEC
                      </div>
                      <div className="rounded border border-gray-100 bg-gray-50/80 p-3 space-y-2">
                        <div className="h-2 rounded bg-gradient-to-r from-cyan-500 to-blue-600" />
                        <p className="font-semibold text-gray-900">Dear [Participant Name],</p>
                        <p className="text-gray-600">
                          Congratulations on successfully participating in <strong>{event.eventName}</strong>! Your official e-certificate has been issued.
                        </p>
                        <div className="py-1 text-center">
                          <span className="inline-block rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-1.5 font-bold text-white text-[11px]">
                            Claim &amp; Download Your Certificate →
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">
                          Enter your registered email on the portal to download in PNG/PDF or add directly to your LinkedIn profile.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={onCloseAction}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartPublish}
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold shadow-lg shadow-primary-500/25"
                id="confirm-publish-button"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {sendEmails ? "Publish & Dispatch Emails" : "Publish Campaign Only"}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: DISPATCHING PROGRESS MODAL */}
        {/* ============================================================== */}
        {step === "dispatching" && (
          <div className="py-6 space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 animate-pulse">
              <svg
                className="h-8 w-8 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            </div>

            <div>
              <h3 className="font-display text-lg font-bold text-gray-900">
                Dispatching Notification Emails
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Please wait while certificates are issued and participants are notified.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-cyan-700">{progressText}</span>
                <span className="font-bold text-gray-800">{progressPercent}%</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: SUMMARY REPORT & COMPLETION */}
        {/* ============================================================== */}
        {step === "completed" && (
          <div className="space-y-5 overflow-y-auto pr-1">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">
                  Campaign Published &amp; Issued!
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  {event.eventName} is now live on the public verification portal.
                </p>
              </div>
            </div>

            {/* Delivery Stats Report */}
            {sendEmails && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-center">
                    <p className="text-xs font-semibold text-emerald-800">Delivered</p>
                    <p className="mt-1 font-display text-2xl font-bold text-emerald-700">
                      {deliveredCount} / {validRecipients.length}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Emails Delivered Successfully
                    </span>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-xs font-semibold text-gray-600">Failed / Skipped</p>
                    <p className="mt-1 font-display text-2xl font-bold text-gray-700">
                      {failedCount}
                    </p>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Invalid or unreachable
                    </span>
                  </div>
                </div>

                {/* Simulated Mode Note */}
                {isSimulated && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2">
                    <span className="text-amber-500 text-sm">💡</span>
                    <div>
                      <p className="font-semibold">Development Preview Mode</p>
                      <p className="mt-0.5 text-[11px] text-amber-800">
                        Emails were validated and simulated successfully. To dispatch live emails to external mailboxes, set <code>SMTP_HOST</code>, <code>SMTP_USER</code>, and <code>SMTP_PASS</code> in your <code>.env.local</code>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Detailed Delivery Log Accordion */}
                {deliveryRecords.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowDetailedLog(!showDetailedLog)}
                      className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 transition-colors"
                    >
                      {showDetailedLog ? "▼ Hide Delivery Log" : "▶ View Recipient Delivery Log"}
                    </button>

                    {showDetailedLog && (
                      <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 text-xs">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400">
                              <th className="py-1 px-2">Participant</th>
                              <th className="py-1 px-2">Email</th>
                              <th className="py-1 px-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-[11px]">
                            {deliveryRecords.map((r, i) => (
                              <tr key={i}>
                                <td className="py-1 px-2 font-medium text-gray-800">
                                  {r.name}
                                </td>
                                <td className="py-1 px-2 text-gray-500 font-mono">
                                  {r.email}
                                </td>
                                <td className="py-1 px-2 text-right">
                                  {r.status === "delivered" ? (
                                    <span className="text-emerald-600 font-bold">
                                      ✓ Sent
                                    </span>
                                  ) : (
                                    <span className="text-red-500 font-bold">
                                      ✗ {r.error || "Failed"}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Modal Done Button */}
            <div className="border-t border-gray-100 pt-4 flex justify-end">
              <button
                type="button"
                onClick={onSuccessAction}
                className="btn-primary px-6 py-2.5 text-xs font-semibold shadow-lg shadow-primary-500/25"
                id="done-publish-btn"
              >
                Done &amp; Return to Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
