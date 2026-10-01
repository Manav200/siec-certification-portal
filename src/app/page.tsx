"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import SiecLogo from "@/components/SiecLogo";
import { useEventStore } from "@/store/useEventStore";
import type { CertificateEvent, CsvRow } from "@/types";

import EventLookupForm from "@/components/portal/EventLookupForm";
import CertificateViewer, {
  type MatchRecord,
} from "@/components/portal/CertificateViewer";
import CertificateErrorView from "@/components/portal/CertificateErrorView";

function PublicPortalContent() {
  const { state } = useEventStore();
  const { events } = state;

  const [hasSearched, setHasSearched] = useState(false);
  const [searchedEmail, setSearchedEmail] = useState("");
  const [lastSelectedEventId, setLastSelectedEventId] = useState("all");
  const [searchResults, setSearchResults] = useState<MatchRecord[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (selectedEventId: string, emailQuery: string) => {
    const query = emailQuery.trim().toLowerCase();
    setSearchedEmail(emailQuery.trim());
    setLastSelectedEventId(selectedEventId);
    setHasSearched(true);
    setActiveMatchIndex(0);
    setIsSearching(true);

    try {
      const res = await fetch("/api/certificates/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: query,
          eventId: selectedEventId === "all" ? undefined : selectedEventId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const matches: MatchRecord[] =
          data.matches || (data.match ? [data.match] : []);
        setSearchResults(matches);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("[Search] Certificate verification error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchAllEvents = () => {
    if (searchedEmail) {
      handleSearch("all", searchedEmail);
    }
  };

  const handleClearSearch = () => {
    setHasSearched(false);
    setSearchResults([]);
    setSearchedEmail("");
  };

  const selectedEventObj = events.find((e) => e.id === lastSelectedEventId);

  return (
    <div className="relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="blob-warm fixed -top-40 -right-40 h-[500px] w-[500px]" />
      <div className="blob-ocean fixed top-1/2 -left-32 h-[400px] w-[400px]" />
      <div className="blob-primary fixed bottom-20 right-1/4 h-[350px] w-[350px]" />

      {/* Hero & Search Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Animated SIEC Logo */}
          <div className="animate-fade-in mb-6">
            <div className="relative inline-block">
              <div className="animate-pulse-glow absolute -inset-4 rounded-2xl bg-gradient-primary opacity-10 blur-xl" />
              <SiecLogo size={72} className="animate-float relative" />
            </div>
          </div>

          {/* Title */}
          <h1 className="animate-fade-in stagger-1 opacity-0 font-display text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            SIEC Certificate{" "}
            <span className="text-gradient-primary">Verification Portal</span>
          </h1>

          <p className="animate-fade-in stagger-2 opacity-0 mt-4 max-w-2xl text-base text-gray-600 leading-relaxed sm:text-lg">
            Enter your registered email address to verify, view, and download
            your official SIEC event certificates instantly.
          </p>

          {/* Form */}
          <div className="mt-8 w-full max-w-3xl">
            <EventLookupForm
              events={events}
              selectedEventId={lastSelectedEventId}
              onSearchAction={handleSearch}
            />
          </div>
        </div>

        {/* Results Area */}
        {hasSearched && (
          <div className="mt-12">
            {isSearching ? (
              <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white/90 p-8 text-center shadow-lg backdrop-blur-md animate-fade-in">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md">
                  <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-gray-900">
                  Verifying Certificate Record...
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Querying the secure database for verified credentials.
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <CertificateViewer
                matches={searchResults}
                activeMatchIndex={activeMatchIndex}
                onSelectMatchIndexAction={setActiveMatchIndex}
                onClearSearchAction={handleClearSearch}
              />
            ) : (
              <CertificateErrorView
                searchedEmail={searchedEmail}
                selectedEventName={selectedEventObj?.eventName}
                isSpecificEventSearch={lastSelectedEventId !== "all"}
                onSearchAllEventsAction={handleSearchAllEvents}
                onClearSearchAction={handleClearSearch}
              />
            )}
          </div>
        )}

        {/* Feature Cards Grid (shown when not viewing active search results) */}
        {!hasSearched && (
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: "Instant Verification",
                desc: "Verify certificate authenticity in seconds with unique verification IDs.",
                gradient: "bg-gradient-ocean",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                ),
                title: "Multi-Event Support",
                desc: "Access certificates for hackathons, workshops, seminars, and conferences.",
                gradient: "bg-gradient-primary",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                ),
                title: "PNG, PDF & LinkedIn Exports",
                desc: "Download high-resolution PNG or print-ready PDF, or add directly to your LinkedIn profile.",
                gradient: "bg-gradient-warm",
              },
            ].map((card, i) => (
              <div
                key={card.title}
                className={`card-hover animate-slide-up opacity-0 stagger-${i + 3} p-6`}
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${card.gradient} text-white shadow-md`}
                >
                  {card.icon}
                </div>
                <h3 className="mb-2 font-display text-base font-bold text-gray-900">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white/40 py-6 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-gray-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SIEC Certificate Automation. All rights reserved.</p>
          <Link
            href="/admin"
            className="flex items-center gap-1 font-medium text-gray-400 transition-colors hover:text-gray-700"
            id="footer-admin-link"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            Admin Portal Access
          </Link>
        </div>
      </footer>

      {/* Footer Accent */}
      <div className="h-1 bg-gradient-warm" />
    </div>
  );
}

export default function PublicPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-cyan-500" />
        </div>
      }
    >
      <PublicPortalContent />
    </Suspense>
  );
}
