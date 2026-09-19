"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { CertificateEvent } from "@/types";

interface EventLookupFormProps {
  events: CertificateEvent[];
  onSearchAction: (selectedEventId: string, emailQuery: string) => void;
}

export default function EventLookupForm({
  events,
  onSearchAction,
}: EventLookupFormProps) {
  const searchParams = useSearchParams();

  // Filter published events and sort in reverse chronological order (newest to oldest)
  const publishedEvents = [...events]
    .filter((e) => e.status === "Published")
    .sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    );

  // Default pre-select: "all" so participants can find their certificate across all events by their mail id
  const defaultEventId = "all";

  const [selectedEventId, setSelectedEventId] = useState<string>(defaultEventId);
  const [emailQuery, setEmailQuery] = useState<string>("");

  // Handle URL deep linking (e.g., /?event=evt-001&email=aarav@example.com)
  useEffect(() => {
    const eventParam = searchParams?.get("event");
    const emailParam = searchParams?.get("email");

    if (eventParam) {
      const match = publishedEvents.find(
        (e) => e.id === eventParam || e.eventName.toLowerCase().includes(eventParam.toLowerCase())
      );
      if (match) {
        setSelectedEventId(match.id);
      } else if (eventParam === "all") {
        setSelectedEventId("all");
      }
    }

    if (emailParam) {
      setEmailQuery(emailParam);
      if (emailParam.trim()) {
        onSearchAction(eventParam || "all", emailParam);
      }
    }
  }, [searchParams, publishedEvents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailQuery.trim()) return;
    onSearchAction(selectedEventId, emailQuery.trim());
  };

  const handleQuickSelectEmail = (email: string) => {
    setEmailQuery(email);
    onSearchAction(selectedEventId, email);
  };

  return (
    <div className="card-hover border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* 1. Event Selector Dropdown */}
          <div className="md:col-span-1">
            <label
              htmlFor="portal-event-select"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
            >
              Select Event / Workshop
            </label>
            <div className="relative">
              <select
                id="portal-event-select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
              >
                <option value="all">🌐 All Past Events (Auto-Detect)</option>
                <optgroup label="Published Events (Latest First)">
                  {publishedEvents.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.eventName} (
                      {new Date(evt.eventDate).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                      )
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. Registered Mail ID Search Bar */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="portal-email-input"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700"
              >
                Registered Mail ID
              </label>
              <span className="text-[11px] text-gray-500">
                Finds your verified certificate instantly
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  id="portal-email-input"
                  type="email"
                  value={emailQuery}
                  onChange={(e) => setEmailQuery(e.target.value)}
                  placeholder="Enter your registered mail ID (e.g. name@example.com)"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 shadow-sm font-medium"
                  required
                />
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
              </div>

              {/* Action Button styled in SIEC Ocean-to-Teal gradient */}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#10B981] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:opacity-95 hover:shadow-cyan-500/40 active:scale-98 cursor-pointer flex-shrink-0"
                id="find-my-certificate-btn"
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
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                Find Certificate
              </button>
            </div>

            {/* Quick Demo Mail ID Suggestions */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-semibold text-gray-500">Quick Test Mail IDs:</span>
              {["aarav@example.com", "priya@example.com", "rahul@example.com"].map((sampleEmail) => (
                <button
                  key={sampleEmail}
                  type="button"
                  onClick={() => handleQuickSelectEmail(sampleEmail)}
                  className="rounded-lg bg-gray-100 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-200 border border-gray-200 px-2 py-0.5 text-[11px] font-mono text-gray-700 transition-colors"
                >
                  {sampleEmail}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
