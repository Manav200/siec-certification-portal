"use client";

import React, { useState } from "react";

interface CertificateErrorViewProps {
  searchedEmail: string;
  selectedEventName?: string;
  isSpecificEventSearch: boolean;
  onSearchAllEventsAction: () => void;
  onClearSearchAction: () => void;
}

export default function CertificateErrorView({
  searchedEmail,
  selectedEventName,
  isSpecificEventSearch,
  onSearchAllEventsAction,
  onClearSearchAction,
}: CertificateErrorViewProps) {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="card border border-amber-200 bg-amber-50/60 p-8 text-center shadow-xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-inner">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <h3 className="font-display text-xl font-bold text-gray-900">
          No Certificate Found
        </h3>

        {isSpecificEventSearch && selectedEventName ? (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            No certificate was found for{" "}
            <span className="font-semibold font-mono text-gray-900">
              {searchedEmail}
            </span>{" "}
            in <span className="font-semibold text-gray-900">{selectedEventName}</span>.
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            No certificate record was found for{" "}
            <span className="font-semibold font-mono text-gray-900">
              {searchedEmail}
            </span>{" "}
            across any published SIEC events.
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isSpecificEventSearch ? (
            <button
              type="button"
              onClick={onSearchAllEventsAction}
              className="btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-semibold shadow-lg shadow-primary-500/20"
              id="search-all-events-btn"
            >
              Search Across All Other Events 🔍
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-semibold shadow-lg shadow-primary-500/20"
              id="contact-support-btn"
            >
              Contact SIEC Support Team
            </button>
          )}

          <button
            type="button"
            onClick={onClearSearchAction}
            className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Try Different Email
          </button>
        </div>
      </div>

      {/* Support Contact Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowSupportModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white p-6 shadow-2xl backdrop-blur-xl animate-scale-in z-10">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-ocean text-white shadow-md">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-3.448l4.138 3.448m-4.138-3.448l-3.448-4.138m0 0a9.014 9.014 0 00-9.424 0M4.33 16.712l4.138-3.448m-4.138 3.448a9.014 9.014 0 010-9.424m4.138 3.448L4.33 7.288" />
                </svg>
              </div>
              <h4 className="font-display text-lg font-bold text-gray-900">
                Contact SIEC Support
              </h4>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                If you completed an event but your certificate isn't showing, please reach out to your faculty coordinator or the SIEC team.
              </p>

              <div className="mt-4 rounded-xl bg-gray-50 p-4 text-left text-xs space-y-2 border border-gray-100">
                <p><span className="font-semibold text-gray-700">Support Email:</span> <a href="mailto:support@siec.org" className="text-primary-600 hover:underline font-mono">support@siec.org</a></p>
                <p><span className="font-semibold text-gray-700">Community Help Desk:</span> SIEC Student Block A, Room 204</p>
                <p><span className="font-semibold text-gray-700">Searched Email:</span> <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono">{searchedEmail}</code></p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="btn-primary w-full justify-center py-2.5 text-xs font-semibold"
                >
                  Close Support Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
