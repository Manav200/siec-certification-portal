"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useEventStore } from "@/store/useEventStore";
import type { CertificateEvent } from "@/types";
import DeleteEventModal from "@/components/admin/DeleteEventModal";

interface EventCardGridProps {
  onViewAnalyticsAction: (event: CertificateEvent) => void;
}

export default function EventCardGrid({ onViewAnalyticsAction }: EventCardGridProps) {
  const router = useRouter();
  const { state, dispatch } = useEventStore();
  const { events, activeEventId } = state;

  const [eventToDelete, setEventToDelete] = useState<CertificateEvent | null>(null);

  const handleEditCanvas = (eventId: string) => {
    dispatch({ type: "SET_ACTIVE_EVENT", payload: eventId });
    router.push("/admin/editor");
  };

  const handleSelectActive = (eventId: string) => {
    dispatch({ type: "SET_ACTIVE_EVENT", payload: eventId });
  };

  const handleConfirmDelete = (eventId: string) => {
    dispatch({ type: "DELETE_EVENT", payload: eventId });
    setEventToDelete(null);
  };

  if (events.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <h3 className="font-display text-lg font-bold text-gray-900">No Events Found</h3>
        <p className="mt-1 text-sm text-gray-500">Create your first event to start generating certificates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-gray-900">
          All Events Overview ({events.length})
        </h2>
        <span className="text-xs text-gray-500">
          Click an event card or use action buttons to manage
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((evt) => {
          const isActive = evt.id === activeEventId;

          return (
            <div
              key={evt.id}
              className={`card-hover relative flex flex-col justify-between overflow-hidden p-6 transition-all duration-300 ${
                isActive
                  ? "border-2 border-primary-500/80 ring-4 ring-primary-500/10 shadow-xl bg-white"
                  : "border border-white/60 bg-white/80"
              }`}
            >
              {/* Active Badge indicator */}
              {isActive && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  Active Context
                </div>
              )}

              {/* Card Main Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 pr-12">
                  <span className="inline-flex items-center rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 border border-primary-100">
                    {evt.category}
                  </span>
                  <span
                    className={
                      evt.status === "Published"
                        ? "badge-published"
                        : "badge-draft"
                    }
                  >
                    {evt.status}
                  </span>
                </div>

                <div>
                  <h3
                    onClick={() => handleSelectActive(evt.id)}
                    className="font-display text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors cursor-pointer line-clamp-2"
                  >
                    {evt.eventName}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {evt.id}
                  </p>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50/80 p-3 text-xs">
                  <div>
                    <span className="block font-medium text-gray-400">Date</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(evt.eventDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="block font-medium text-gray-400">Participants</span>
                    <span className="font-semibold text-gray-800">
                      {evt.csvData.length} Recipients
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="mt-6 flex flex-col gap-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => handleEditCanvas(evt.id)}
                  className="btn-primary w-full justify-center py-2 text-xs font-semibold shadow-md shadow-primary-500/15"
                  id={`edit-canvas-${evt.id}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Edit Certificate Canvas
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewAnalyticsAction(evt)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                    id={`view-analytics-${evt.id}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    View Analytics
                  </button>

                  <button
                    onClick={() => setEventToDelete(evt)}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50/60 p-2 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-300 transition-colors shadow-sm"
                    id={`delete-event-${evt.id}`}
                    title="Delete Event"
                    aria-label={`Delete event ${evt.eventName}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Event Confirmation Modal */}
      <DeleteEventModal
        event={eventToDelete}
        isOpen={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
