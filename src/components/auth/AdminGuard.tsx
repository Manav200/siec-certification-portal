"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import SiecLogo from "@/components/SiecLogo";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAdmin, loading, logoutAction } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If finished loading and no user is logged in, redirect to login page
    if (!loading && !user) {
      router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary-200 opacity-40" />
          <SiecLogo size={52} className="relative animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Verifying Admin Authorization...</p>
        <p className="text-xs text-gray-400 mt-1">Connecting to SIEC Authentication Service</p>
      </div>
    );
  }

  // 2. Unauthenticated State (redirecting)
  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
        <div className="card max-w-md p-8 text-center border border-white/60 shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="font-display text-lg font-bold text-gray-900">Admin Authentication Required</h2>
          <p className="mt-2 text-xs text-gray-500">
            You must be signed in with an authorized SIEC admin account to access the event management workspace.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={`/admin/login?redirect=${encodeURIComponent(pathname)}`}
              className="btn-primary w-full text-center text-xs py-2.5 font-bold"
            >
              Sign In to Admin Workspace
            </Link>
            <Link href="/" className="btn-secondary w-full text-center text-xs py-2">
              Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated but Unauthorized (Role: Non-Admin)
  if (!isAdmin) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
        <div className="card max-w-md p-8 text-center border border-red-100 shadow-2xl bg-white/95">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
          </div>
          <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold text-red-700">
            403 Forbidden
          </span>
          <h2 className="font-display text-xl font-bold text-gray-900 mt-2">
            Admin Authorization Required
          </h2>
          <p className="mt-2 text-xs text-gray-600 leading-relaxed">
            You are signed in as <span className="font-semibold text-gray-900">{user.email}</span>, but this account does not have administrator privileges to manage SIEC events.
          </p>

          <div className="mt-4 rounded-xl bg-gray-50 p-3 text-left border border-gray-100 text-[11px] text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">To gain access:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Add this email to <code className="bg-gray-200 px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_ADMIN_EMAILS</code> in your environment, or</li>
              <li>Set role to <code className="bg-gray-200 px-1 py-0.5 rounded text-[10px]">&quot;admin&quot;</code> in the Firestore users collection.</li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => logoutAction()}
              className="btn-primary w-full text-xs py-2.5 font-bold"
            >
              Sign Out &amp; Switch Account
            </button>
            <Link href="/" className="btn-secondary w-full text-center text-xs py-2">
              Back to Certificate Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated & Authorized Admin
  return <>{children}</>;
}
