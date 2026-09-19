"use client";

import React from "react";
import { useEventStore } from "@/store/useEventStore";

interface EventHeaderBarProps {
  onOpenCreateModalAction: () => void;
}

export default function EventHeaderBar({
  onOpenCreateModalAction,
}: EventHeaderBarProps) {
  const { state, dispatch } = useEventStore();
  const { events, activeEventId } = state;

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: "SET_ACTIVE_EVENT", payload: e.target.value });
  };

  return (
    <div className="card-hover border border-white/40 bg-white/70 p-5 shadow-xl backdrop-blur-md animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left: Active Event Dropdown & Details */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <label
              htmlFor="active-event-select"
              className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1"
            >
              Active Workspace Context
            </label>
            <div className="relative min-w-[260px]">
              <select
                id="active-event-select"
                value={activeEvent?.id || ""}
                onChange={handleEventChange}
                disabled={events.length === 0}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white/90 px-4 py-2.5 pr-10 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {events.length === 0 ? (
                  <option value="">No events created yet</option>
                ) : (
                  events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.eventName} ({evt.category})
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Event Info pill */}
          {activeEvent && (
            <div className="flex items-center gap-2 self-end sm:self-center rounded-xl bg-gray-100/80 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200/50">
              <span
                className={`h-2 w-2 rounded-full ${
                  activeEvent.status === "Published"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
              />
              <span className="font-semibold text-gray-900">
                {activeEvent.status}
              </span>
              <span className="text-gray-300">•</span>
              <span>{activeEvent.csvData.length} Recipients</span>
            </div>
          )}
        </div>

        {/* Right: [+ Create New Event] Modal Button */}
        <button
          onClick={onOpenCreateModalAction}
          className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 px-5 py-2.5 text-sm font-semibold"
          id="open-create-event-modal-btn"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Create New Event
        </button>
      </div>
    </div>
  );
}
