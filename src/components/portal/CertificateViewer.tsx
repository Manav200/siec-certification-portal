"use client";

import React, { useRef, useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import type { CertificateEvent, CsvRow, CanvasConfig } from "@/types";
import { PRESET_TEMPLATES } from "@/utils/defaultTemplates";

export interface MatchRecord {
  event: CertificateEvent;
  participant: CsvRow;
}

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

  const activeRecord = matches[activeMatchIndex] || matches[0];

  useEffect(() => {
    if (!activeRecord || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { event, participant } = activeRecord;

    // Default template image if none uploaded
    const imageUrl = event.baseImageUrl || PRESET_TEMPLATES[0].dataUrl;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw configured variable text fields
      const configs = event.canvasConfigs && event.canvasConfigs.length > 0
        ? event.canvasConfigs
        : [
            {
              id: "def-1",
              variableName: "Participant Name",
              x: 600,
              y: 280,
              fontSize: 38,
              fontFamily: "Inter",
              color: "#111827",
              alignment: "center" as const,
            },
            {
              id: "def-2",
              variableName: "Event Name",
              x: 600,
              y: 360,
              fontSize: 22,
              fontFamily: "Inter",
              color: "#4b5563",
              alignment: "center" as const,
            },
            {
              id: "def-3",
              variableName: "Role",
              x: 600,
              y: 420,
              fontSize: 18,
              fontFamily: "Inter",
              color: "#6b7280",
              alignment: "center" as const,
            },
          ];

      // Wait for all custom fonts (Cinzel, Playfair, Montserrat, Inter) to load
      // so canvas measurements and rendering match the admin preview exactly
      document.fonts.ready.then(() => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        configs.forEach((config) => {
          let textValue = config.customText && config.customText.trim() !== ""
            ? config.customText
            : "";

          if (!textValue) {
            switch (config.variableName) {
              case "Participant Name":
                textValue =
                  participant.name ||
                  participant.Name ||
                  participant["Participant Name"] ||
                  participant["participant name"] ||
                  "Valued Participant";
                break;
              case "Event Name":
                textValue = event.eventName;
                break;
              case "Role":
                textValue = participant.role || participant.Role || "Participant";
                break;
              case "Issue Date":
                textValue =
                  participant.issueDate ||
                  participant.IssueDate ||
                  participant.date ||
                  participant.Date ||
                  new Date(event.eventDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                break;
              case "Certificate ID":
                textValue = `CERT-${event.id.replace("evt-", "")}-${Math.floor(
                  1000 + Math.random() * 9000
                )}`;
                break;
              default: {
                if (
                  participant[config.variableName] !== undefined &&
                  participant[config.variableName] !== ""
                ) {
                  textValue = String(participant[config.variableName]);
                } else {
                  // Case-insensitive key lookup across participant object
                  const matchedKey = Object.keys(participant).find(
                    (k) =>
                      k.trim().toLowerCase() ===
                      config.variableName.trim().toLowerCase()
                  );
                  if (
                    matchedKey &&
                    participant[matchedKey] !== undefined &&
                    participant[matchedKey] !== ""
                  ) {
                    textValue = String(participant[matchedKey]);
                  } else {
                    textValue = config.variableName;
                  }
                }
              }
            }
          }

          const align = config.alignment || "center";

          ctx.save();
          ctx.font = `bold ${config.fontSize}px ${config.fontFamily}, sans-serif`;
          ctx.fillStyle = config.color;
          // Set alignment to match the admin studio horizontal anchor
          ctx.textAlign = align;
          // textBaseline middle matches translateY(-50%) in the admin studio
          ctx.textBaseline = "middle";

          ctx.fillText(textValue, config.x, config.y);
          ctx.restore();
        });
      });
    };
  }, [activeRecord]);

  if (!activeRecord) return null;

  const { event, participant } = activeRecord;
  const participantName =
    participant.name || participant.Name || "Participant";
  const participantRole =
    participant.role || participant.Role || "Participant";

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

  // Download JPG Export
  const handleDownloadJpg = () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    const link = document.createElement("a");
    link.download = `SIEC-Certificate-${participantName.replace(/\s+/g, "-")}.jpg`;
    link.href = canvasRef.current.toDataURL("image/jpeg", 0.92);
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

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Header Info & Multi-Match Selector */}
      <div className="card border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-display text-lg font-bold text-gray-900">
                Certificate Verified &amp; Ready!
              </h3>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Found certificate for <span className="font-semibold text-gray-900">{participantName}</span> ({participantRole}) in <span className="font-semibold text-gray-900">{event.eventName}</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={onClearSearchAction}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm"
          >
            ← New Search
          </button>
        </div>

        {/* Multi-Match Tabs if email matches multiple events */}
        {matches.length > 1 && (
          <div className="mt-4 border-t border-emerald-200/60 pt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
              Multiple Certificates Found ({matches.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {matches.map((m, i) => (
                <button
                  key={m.event.id}
                  onClick={() => onSelectMatchIndexAction(i)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeMatchIndex === i
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {m.event.eventName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* HTML5 Canvas Rendering Viewport — responsive, no sliding, fully visible at once */}
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

      {/* Download Action Toolbar */}
      <div className="card border border-white/60 bg-white/90 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="font-display text-sm font-bold text-gray-900">
              Download Your Verified Certificate
            </h4>
            <p className="text-xs text-gray-500">
              Choose your preferred high-resolution format for sharing on LinkedIn or printing.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Download PNG */}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all active:scale-95 disabled:opacity-50"
              id="download-png-btn"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PNG
            </button>

            {/* Download JPG */}
            <button
              type="button"
              onClick={handleDownloadJpg}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all active:scale-95 disabled:opacity-50"
              id="download-jpg-btn"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download JPG
            </button>

            {/* Download PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all active:scale-95 disabled:opacity-50"
              id="download-pdf-btn"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
