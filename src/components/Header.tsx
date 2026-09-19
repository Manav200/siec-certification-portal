"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SiecLogo from "./SiecLogo";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logoutAction } = useAuth();

  const handleSignOut = async () => {
    await logoutAction();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top gradient bar */}
      <div className="bg-gradient-ocean h-1" />

      {/* Main header */}
      <div className="glass border-b border-white/20 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo & Branding */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-primary opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-40" />
              <SiecLogo size={44} className="relative" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-gray-900 font-display">
                SIEC
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-widest text-gray-500 sm:block">
                Student Industry Engagement Community &amp; Clubs
              </span>
            </div>
          </Link>

          {/* Navigation & Auth Controls */}
          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className={`relative rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                pathname === "/"
                  ? "text-gray-900 bg-white/60 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
              }`}
            >
              Public Portal
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`relative rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                  pathname.startsWith("/admin") && pathname !== "/admin/login"
                    ? "text-primary-700 bg-primary-50 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
                }`}
              >
                Admin Studio
              </Link>
            )}

            {/* Auth Profile / Actions */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-800 max-w-[140px] truncate">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                  <span className="text-[10px] text-primary-600 font-semibold uppercase tracking-wider flex items-center gap-1">
                    {isAdmin ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Admin
                      </>
                    ) : (
                      "Member"
                    )}
                  </span>
                </div>

                <div className="h-8 w-8 rounded-full bg-gradient-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors shadow-xs"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 hover:bg-black px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                <svg
                  className="h-3.5 w-3.5 text-white/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <span>Admin Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
