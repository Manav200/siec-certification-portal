"use client";

import React from "react";
import type { CertificateEvent } from "@/types";

interface EventAnalyticsModalProps {
  event: CertificateEvent | null;
  onCloseAction: () => void;
}

export default function EventAnalyticsModal({
  event,
  onCloseAction,
}: EventAnalyticsModalProps) {
  if (!event) return null;

  // Compute analytics metrics
  const totalRecipients = event.csvData.length;
  const rolesCount: Record<string, number> = {};

  event.csvData.forEach((row) => {
    const role = row.role || row.Role || "Participant";
    rolesCount[role] = (rolesCount[role] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onCloseAction}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/40 bg-white p-6 shadow-2xl backdrop-blur-xl animate-scale-in z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-ocean text-white shadow-md">
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
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-gray-900">
                {event.eventName} — Analytics
              </h3>
              <p className="text-xs text-gray-500">
                Category: <span className="font-semibold">{event.category}</span> • ID:{" "}
                <span className="font-mono">{event.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onCloseAction}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Participants
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-gray-900">
                {totalRecipients}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Publish Status
              </p>
              <span
                className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${
                  event.status === "Published"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {event.status}
              </span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Date
              </p>
              <p className="mt-1 font-display text-sm font-semibold text-gray-900">
                {new Date(event.eventDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Role Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
              Participant Roles Breakdown
            </h4>

            {Object.keys(rolesCount).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(rolesCount).map(([role, count]) => {
                  const percentage = Math.round((count / totalRecipients) * 100);
                  return (
                    <div key={role} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-gray-700">
                        <span>{role}</span>
                        <span>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                No participant CSV data uploaded yet for this event.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 border-t border-gray-100 pt-4 flex justify-end">
          <button
            onClick={onCloseAction}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
