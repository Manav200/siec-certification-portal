"use client";

import React, { useState } from "react";
import { useEventStore } from "@/store/useEventStore";
import { useAuth } from "@/context/AuthContext";
import type { CertificateEvent } from "@/types";
import EventHeaderBar from "@/components/admin/EventHeaderBar";
import CreateEventModal from "@/components/admin/CreateEventModal";
import EventCardGrid from "@/components/admin/EventCardGrid";
import EventAnalyticsModal from "@/components/admin/EventAnalyticsModal";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { state } = useEventStore();
  const { events } = state;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnalyticsEvent, setSelectedAnalyticsEvent] =
    useState<CertificateEvent | null>(null);

  const publishedCount = events.filter((e) => e.status === "Published").length;
  const draftCount = events.filter((e) => e.status === "Draft").length;
  const totalRecipients = events.reduce(
    (sum, e) => sum + e.csvData.length,
    0
  );

  const statCards = [
    {
      label: "Total Events",
      value: events.length,
      gradient: "bg-gradient-ocean",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      label: "Published",
      value: publishedCount,
      gradient: "bg-gradient-primary",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Drafts",
      value: draftCount,
      gradient: "bg-gradient-warm",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      ),
    },
    {
      label: "Total Recipients",
      value: totalRecipients,
      gradient: "bg-gradient-ocean",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 tracking-tight">
            Admin Event Workspace
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create events, manage certificate templates, and track participant analytics.
          </p>
        </div>

        {/* Private Workspace Security Badge */}
        {user?.email && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50/80 border border-blue-200/80 px-3.5 py-2 text-xs text-blue-900 shadow-sm self-start sm:self-auto">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Isolated Workspace: <strong className="font-semibold">{user.email}</strong>
            </span>
            <span className="text-blue-300">•</span>
            <span className="text-[11px] text-blue-700 font-medium">Private Data</span>
          </div>
        )}
      </div>

      {/* Event Header Bar (Active Event Selector & Create Event Button) */}
      <EventHeaderBar
        onOpenCreateModalAction={() => setIsCreateModalOpen(true)}
      />

      {/* Stat Cards Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className={`card-hover animate-slide-up opacity-0 stagger-${i + 1} p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="mt-1 font-display text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.gradient} text-white shadow-lg`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Cards Grid */}
      <EventCardGrid
        onViewAnalyticsAction={(event) => setSelectedAnalyticsEvent(event)}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onCloseAction={() => setIsCreateModalOpen(false)}
      />

      {/* Event Analytics Modal */}
      <EventAnalyticsModal
        event={selectedAnalyticsEvent}
        onCloseAction={() => setSelectedAnalyticsEvent(null)}
      />
    </div>
  );
}
