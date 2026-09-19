"use client";

import React from "react";
import type { CertificateEvent } from "@/types";

interface DeleteEventModalProps {
  event: CertificateEvent | null;
  isOpen: boolean;
  onCloseAction: () => void;
  onConfirmDeleteAction: (eventId: string) => void;
}

export default function DeleteEventModal({
  event,
  isOpen,
  onCloseAction,
  onConfirmDeleteAction,
}: DeleteEventModalProps) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onCloseAction}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/40 bg-white p-6 shadow-2xl backdrop-blur-xl animate-scale-in z-10">
        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-inner">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-gray-900">
              Delete Event
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Are you sure you want to permanently delete this event? This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Event Preview Info Box */}
        <div className="mt-5 rounded-xl border border-red-100 bg-red-50/40 p-3.5 text-xs text-gray-700 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-500">Event Name:</span>
            <span className="font-bold text-gray-900 line-clamp-1 max-w-[200px]">
              {event.eventName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-500">Category:</span>
            <span className="font-semibold text-gray-800">{event.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-500">Recipients:</span>
            <span className="font-semibold text-gray-800">
              {event.csvData.length} records
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-500">Status:</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                event.status === "Published"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {event.status}
            </span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-gray-500">
          All associated certificate designs and participant records will be permanently removed from your dashboard and database.
        </p>

        {/* Modal Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onCloseAction}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirmDeleteAction(event.id)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25"
            id={`confirm-delete-btn-${event.id}`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            Yes, Delete Event
          </button>
        </div>
      </div>
    </div>
  );
}
