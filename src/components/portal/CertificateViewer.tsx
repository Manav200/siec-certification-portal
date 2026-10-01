"use client";

import React, { useRef, useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import {
  drawCertificate,
  getCertificateId,
  generateCertificatesZip,
  type MatchRecord,
} from "@/utils/certificateRenderer";

export type { MatchRecord };

interface CertificateViewerProps {
  matches: MatchRecord[];
  activeMatchIndex: number;
  onSelectMatchIndexAction: (index: number) => void;
  onClearSearchAction: () => void;
}

export default function CertificateViewer({
  matches,
  activeMatchIndex,
  onSelectMatchIndexAction,
  onClearSearchAction,
}: CertificateViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [zipNotice, setZipNotice] = useState<string | null>(null);

  const recordsToZip = matches;

  const activeRecord = matches[activeMatchIndex] || matches[0];

  useEffect(() => {
    if (!activeRecord || !canvasRef.current) return;

    drawCertificate(
      canvasRef.current,
      activeRecord.event,
      activeRecord.participant
    ).catch((err) => {
      console.error("Canvas draw failed:", err);
    });
  }, [activeRecord]);

  if (!activeRecord) return null;

  const { event, participant } = activeRecord;
  const participantName =
    participant.name || participant.Name || "Participant";
  const participantRole =
    participant.role || participant.Role || "Participant";

  const participantEmail = (
    participant.email ||
    participant.Email ||
    participant.EMAIL ||
    participant["Email Address"] ||
    participant["email address"] ||
    participant["Email ID"] ||
    participant["email id"] ||
    participant["Mail ID"] ||
    participant["mail id"] ||
    participant["Mail"] ||
    ""
  )
    .toString()
    .trim();

  const certId = getCertificateId(event, participant);

  const rawDate =
    participant.issueDate ||
    participant.IssueDate ||
    participant.date ||
    participant.Date ||
    event.eventDate ||
    new Date().toISOString();
  const dateObj = new Date(rawDate);
  const issueYear = isNaN(dateObj.getFullYear())
    ? new Date().getFullYear()
    : dateObj.getFullYear();
  const issueMonth = isNaN(dateObj.getMonth())
    ? new Date().getMonth() + 1
    : dateObj.getMonth() + 1;

  // Add to LinkedIn Profile Handler
  const handleAddToLinkedIn = () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://siec-certification-portal.vercel.app";
    const certUrl = `${origin}/?event=${encodeURIComponent(
      event.id
    )}&email=${encodeURIComponent(participantEmail)}`;
    const certName = `${event.eventName} E-Certificate`;
    const orgName = "Student Industry Engagement Community (SIEC)";

    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: certName,
      organizationName: orgName,
      issueYear: String(issueYear),
      issueMonth: String(issueMonth),
      certUrl: certUrl,
      certId: String(certId),
    });

    const linkedInUrl = `https://www.linkedin.com/profile/add?${params.toString()}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  };

  // Download PNG Export
  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    const link = document.createElement("a");
    link.download = `SIEC-Certificate-${participantName.replace(/\s+/g, "-")}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    setIsExporting(false);
  };

  // Download PDF Export via jsPDF
  const handleDownloadPdf = () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    try {
      const imgData = canvasRef.current.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1200, 800],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 1200, 800);
      pdf.save(`SIEC-Certificate-${participantName.replace(/\s+/g, "-")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Download All Certificates (.ZIP)
  const handleDownloadAllZip = async () => {
    if (isGeneratingZip || recordsToZip.length === 0) return;
    setIsGeneratingZip(true);
    setZipNotice(null);
    setZipProgress({ current: 1, total: recordsToZip.length });

    try {
      const result = await generateCertificatesZip(
        recordsToZip,
        (current, total) => {
          setZipProgress({ current, total });
        }
      );

      if (result.skippedEvents.length > 0) {
        setZipNotice(
          `Skipped ${result.skippedEvents.join(
            ", "
          )} due to template rendering error. Remaining ${
            result.successCount
          } certificate(s) were successfully packaged into the ZIP.`
        );
      }
    } catch (err: unknown) {
      console.error("ZIP download failed:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to generate ZIP archive. Please try again.";
      setZipNotice(msg);
    } finally {
      setIsGeneratingZip(false);
      setZipProgress(null);
    }
  };

  return (
    <div className="space-y-6 animate-scale-in">
      {/* ─── Prominent Top Result Header with Download All ZIP Button ─── */}
      <div className="card overflow-hidden border border-cyan-200/80 bg-gradient-to-r from-cyan-50/70 via-white to-emerald-50/70 p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#10B981] text-white shadow-md shadow-cyan-500/25">
              {/* Folder/Zip Archive Icon */}
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
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-display text-base sm:text-lg font-bold text-gray-900">
                  {recordsToZip.length > 1
                    ? `Verified Certificates Found (${recordsToZip.length})`
                    : "Certificate Verified & Ready!"}
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-gray-600">
                Found certificate for{" "}
                <span className="font-semibold text-gray-900">
                  {participantName}
                </span>{" "}
                ({participantRole}) in{" "}
                <span className="font-semibold text-gray-900">
                  {event.eventName}
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Prominent Download All Certificates (.ZIP) Button */}
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={isGeneratingZip}
              id="download-all-zip-btn"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#10B981] hover:from-[#0891b2] hover:to-[#059669] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all active:scale-95 disabled:opacity-85 disabled:cursor-wait cursor-pointer"
            >
              {isGeneratingZip ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-white flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>
                    Generating ZIP... (Processing {zipProgress?.current || 1} of{" "}
                    {zipProgress?.total || recordsToZip.length})
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
                    />
                  </svg>
                  <span>Download All Certificates (.ZIP)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClearSearchAction}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm cursor-pointer"
            >
              ← New Search
            </button>
          </div>
        </div>

        {/* Multi-Match Tabs if participant has certificates in multiple events */}
        {matches.length > 1 && (
          <div className="mt-4 border-t border-cyan-200/60 pt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
              Switch Certificate Preview ({matches.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {matches.map((m, i) => (
                <button
                  key={`${m.event.id}-${i}`}
                  onClick={() => onSelectMatchIndexAction(i)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    activeMatchIndex === i
                      ? "bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {m.event.eventName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notification Banner for Skipped or Errored Templates */}
        {zipNotice && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 animate-fade-in">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-amber-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <span>{zipNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setZipNotice(null)}
              className="ml-3 font-bold hover:text-amber-950 text-amber-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ─── HTML5 Canvas Rendering Viewport ─── */}
      <div className="card border border-white/60 p-3 sm:p-5 shadow-2xl bg-white flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            className="w-full h-auto max-h-[72vh] object-contain block"
          />
        </div>
      </div>

      {/* ─── Download Action Toolbar ─── */}
      <div className="card border border-white/60 bg-white/90 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="font-display text-sm font-bold text-gray-900">
              Download Your Verified Certificate
            </h4>
            <p className="text-xs text-gray-500">
              Choose your preferred high-resolution format, get all certificates
              in a ZIP archive, or add directly to LinkedIn.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {/* Add to LinkedIn Profile */}
            <button
              type="button"
              onClick={handleAddToLinkedIn}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0077b5] via-[#0a66c2] to-cyan-600 hover:from-[#006097] hover:to-cyan-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
              id="add-linkedin-btn"
              title="Add this certification to your official LinkedIn profile"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Add to LinkedIn
            </button>

            {/* Download PNG */}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              id="download-png-btn"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Download PNG
            </button>

            {/* Download PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              id="download-pdf-btn"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              Download PDF
            </button>

            {/* Download All (.ZIP) Toolbar button */}
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={isGeneratingZip}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#10B981] hover:from-[#0891b2] hover:to-[#059669] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-75 cursor-pointer"
              id="toolbar-download-zip-btn"
              title="Download all certificates packaged in a ZIP file"
            >
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
              {isGeneratingZip
                ? `Generating... (${zipProgress?.current || 1}/${
                    zipProgress?.total || recordsToZip.length
                  })`
                : "Download All (.ZIP)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
