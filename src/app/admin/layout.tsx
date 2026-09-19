"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/auth/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Allow unrestricted access to the admin login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // All other /admin/* routes require Admin authentication & authorization
  return <AdminGuard>{children}</AdminGuard>;
}
