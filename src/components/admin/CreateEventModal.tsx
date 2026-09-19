"use client";

import React, { useState } from "react";
import { useEventStore } from "@/store/useEventStore";
import { useAuth } from "@/context/AuthContext";
import type { CertificateEvent } from "@/types";

interface CreateEventModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

const CATEGORIES = [
  "Hackathon",
  "Workshop",
  "Seminar",
  "Competition",
  "Conference",
  "Webinar",
  "Bootcamp",
];

export default function CreateEventModal({
  isOpen,
  onCloseAction,
}: CreateEventModalProps) {
  const { dispatch } = useEventStore();
  const { user } = useAuth();
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("Hackathon");
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventName.trim()) {
      setError("Event name is required.");
      return;
    }
    if (!eventDate) {
      setError("Event date is required.");
      return;
    }

    const newEvent: CertificateEvent = {
      id: `evt-${Date.now().toString().slice(-6)}`,
      adminId: user?.uid || "unassigned",
      creatorEmail: user?.email || "",
      eventName: eventName.trim(),
      category: category,
      eventDate: eventDate,
      status: "Draft",
      baseImageUrl: "",
      csvData: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_EVENT", payload: newEvent });

    // Reset form state and close modal
    setEventName("");
    setCategory("Hackathon");
    setError("");
    onCloseAction();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onCloseAction}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/40 bg-white p-6 shadow-2xl backdrop-blur-xl animate-scale-in z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-md">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-gray-900">
                Create New Event
              </h3>
              <p className="text-xs text-gray-500">
                Set up a new event to manage certificates &amp; participants.
              </p>
            </div>
          </div>
          <button
            onClick={onCloseAction}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100 animate-fade-in">
              {error}
            </div>
          )}

          {/* Event Name */}
          <div>
            <label
              htmlFor="modal-event-name"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
            >
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              id="modal-event-name"
              type="text"
              value={eventName}
              onChange={(e) => {
                setEventName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. DropHack 2026, Security Sandbox"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              autoFocus
            />
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="modal-event-category"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="modal-event-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="modal-event-date"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                id="modal-event-date"
                type="date"
                value={eventDate}
                onChange={(e) => {
                  setEventDate(e.target.value);
                  if (error) setError("");
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onCloseAction}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2.5 text-sm font-semibold shadow-lg shadow-primary-500/25"
              id="submit-create-event-btn"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
