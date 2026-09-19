"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SiecLogo from "./SiecLogo";
import { ADMIN_AUTH_CONFIG } from "@/config/auth";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);

  useEffect(() => {
    // Check local storage for session state on client mount
    const authStatus = localStorage.getItem(ADMIN_AUTH_CONFIG.STORAGE_KEY);
    setIsAuthenticated(authStatus === "true");
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_AUTH_CONFIG.PASSCODE) {
      localStorage.setItem(ADMIN_AUTH_CONFIG.STORAGE_KEY, "true");
      setIsAuthenticated(true);
      setError("");
      setPasscode("");
    } else {
      setError("Invalid passcode. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_CONFIG.STORAGE_KEY);
    setIsAuthenticated(false);
  };

  // Prevent flash while checking local storage
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600" />
      </div>
    );
  }

  // Render Login Gate if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-[75vh] items-center justify-center px-4 py-12">
        {/* Background decorative blobs */}
        <div className="blob-primary fixed -top-20 -left-20 h-72 w-72" />
        <div className="blob-warm fixed bottom-10 right-10 h-72 w-72" />

        <div className="animate-scale-in relative w-full max-w-md">
          {/* Card */}
          <div className="card border border-white/40 p-8 shadow-2xl backdrop-blur-xl">
            {/* Header / Logo */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="animate-pulse-glow absolute -inset-2 rounded-2xl bg-gradient-primary opacity-20 blur-md" />
                <SiecLogo size={64} className="relative" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900">
                Admin Workspace Access
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter the administrator passcode to manage events and certificates.
              </p>
            </div>

            {/* Passcode Form */}
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-passcode"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Admin Passcode
                </label>
                <div className="relative mt-1">
                  <input
                    id="admin-passcode"
                    type={showPasscode ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter passcode..."
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium px-1 py-0.5"
                  >
                    {showPasscode ? "Hide" : "Show"}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-xs font-medium text-red-500 animate-fade-in">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center py-3 font-semibold shadow-lg shadow-primary-500/20"
                id="admin-login-submit"
              >
                Authenticate &amp; Enter
              </button>
            </form>

            {/* Default hint note */}
            <div className="mt-6 rounded-xl bg-gray-50/80 p-3 text-center text-xs text-gray-500 border border-gray-100">
              <span className="font-semibold text-gray-700">Demo Passcode:</span>{" "}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-gray-800">
                admin123
              </code>
            </div>

            {/* Back to Candidate Portal */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                <svg
                  className="h-3.5 w-3.5"
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
                Return to Candidate Certificate Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Authenticated Admin Workspace with logout toolbar
  return (
    <div>
      {/* Top Admin Action Bar */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            Authenticated Admin Session
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 shadow-sm"
          id="admin-logout-btn"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Lock / Logout
        </button>
      </div>

      {children}
    </div>
  );
}
