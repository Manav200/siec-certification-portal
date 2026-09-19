import React from "react";
import Link from "next/link";
import SiecLogo from "@/components/SiecLogo";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-2 rounded-2xl bg-gradient-primary opacity-25 blur-lg" />
        <SiecLogo size={64} className="relative" />
      </div>
      <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800">
        404 Not Found
      </span>
      <h2 className="font-display text-2xl font-bold text-gray-900 mt-3">
        Page Not Found
      </h2>
      <p className="mt-2 text-xs text-gray-500 max-w-sm">
        The page you are looking for does not exist, has been removed, or is currently unavailable.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary text-xs py-2 px-4 font-bold">
          Return to Certificate Portal
        </Link>
        <Link href="/admin" className="btn-secondary text-xs py-2 px-4 font-bold">
          Admin Workspace
        </Link>
      </div>
    </div>
  );
}
