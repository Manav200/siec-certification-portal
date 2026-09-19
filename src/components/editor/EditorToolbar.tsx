"use client";

import React from "react";
import Link from "next/link";
import type { CertificateEvent } from "@/types";

interface EditorToolbarProps {
  event: CertificateEvent;
  isPreviewMode: boolean;
  onTogglePreviewAction: () => void;
  onSaveAndPublishAction: () => void;
}

export default function EditorToolbar({
  event,
  isPreviewMode,
  onTogglePreviewAction,
  onSaveAndPublishAction,
}: EditorToolbarProps) {
  return (
    <div className="card border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-md animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Back Link & Event Info */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 shadow-sm"
            title="Return to Admin Workspace"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-gray-900">
                {event.eventName}
              </h2>
              <span className="inline-flex items-center rounded-lg bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-800">
                {event.category}
              </span>
              <span
                className={
                  event.status === "Published"
                    ? "badge-published"
                    : "badge-draft"
                }
              >
                {event.status}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Phase 3: Interactive Canvas &amp; CSV/Excel Processing Studio
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* [Preview Row 1] Toggle */}
          <button
            type="button"
            onClick={onTogglePreviewAction}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all shadow-sm ${
              isPreviewMode
                ? "border border-amber-300 bg-amber-50 text-amber-800 ring-2 ring-amber-400/30"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
            id="toggle-preview-btn"
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
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.573 16.49 16.638 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {isPreviewMode ? "Preview Mode ON (Row 1)" : "Preview Row 1"}
          </button>

          {/* [Save & Publish Campaign] */}
          <button
            type="button"
            onClick={onSaveAndPublishAction}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold shadow-lg shadow-primary-500/25"
            id="save-publish-btn"
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
            Save &amp; Publish Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
