import type { Metadata } from "next";
import "./globals.css";
import { EventStoreProvider } from "@/store/useEventStore";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "SIEC Certificate Generator | Multi-Event Certificate Automation",
  description:
    "Generate, manage, and verify certificates for all SIEC events — workshops, hackathons, seminars, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-siec-bg font-sans antialiased">
        <AuthProvider>
          <EventStoreProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
          </EventStoreProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
