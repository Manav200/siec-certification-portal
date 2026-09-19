"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type {
  CertificateEvent,
  EventAction,
  EventStoreState,
} from "@/types";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_EVENTS: CertificateEvent[] = [
  {
    id: "evt-001",
    eventName: "AI & Machine Learning Workshop 2026",
    category: "Workshop",
    eventDate: "2026-08-15",
    status: "Published",
    baseImageUrl: "",
    csvData: [
      {
        name: "Aarav Sharma",
        email: "aarav@example.com",
        role: "Participant",
        issueDate: "2026-08-15",
        college: "Vellore Institute of Technology",
        department: "Computer Science",
        rank: "1st Position",
      },
      {
        name: "Priya Patel",
        email: "priya@example.com",
        role: "Participant",
        issueDate: "2026-08-15",
        college: "BITS Pilani",
        department: "Information Technology",
        rank: "2nd Position",
      },
      {
        name: "Rahul Gupta",
        email: "rahul@example.com",
        role: "Volunteer",
        issueDate: "2026-08-15",
        college: "IIT Madras",
        department: "Electrical Engg",
        rank: "Special Mention",
      },
    ],
    canvasConfigs: [
      {
        id: "cfg-1",
        variableName: "Participant Name",
        x: 600,
        y: 280,
        fontSize: 36,
        fontFamily: "Inter",
        color: "#111827",
        alignment: "center",
      },
      {
        id: "cfg-2",
        variableName: "Event Name",
        x: 600,
        y: 360,
        fontSize: 22,
        fontFamily: "Inter",
        color: "#4b5563",
        alignment: "center",
      },
      {
        id: "cfg-3",
        variableName: "Role",
        x: 600,
        y: 420,
        fontSize: 18,
        fontFamily: "Inter",
        color: "#6b7280",
        alignment: "center",
      },
    ],
  },
  {
    id: "evt-002",
    eventName: "Hackathon: Code for Change",
    category: "Competition",
    eventDate: "2026-09-01",
    status: "Draft",
    baseImageUrl: "",
    csvData: [
      { name: "Neha Verma", email: "neha@example.com", role: "Winner", issueDate: "2026-09-01" },
      { name: "Vikram Singh", email: "vikram@example.com", role: "Runner-up", issueDate: "2026-09-01" },
    ],
    canvasConfigs: [],
  },
  {
    id: "evt-003",
    eventName: "Leadership Summit 2026",
    category: "Seminar",
    eventDate: "2026-10-20",
    status: "Draft",
    baseImageUrl: "",
    csvData: [],
    canvasConfigs: [],
  },
];

// ─── Reducer ────────────────────────────────────────────────────────────────

function eventReducer(
  state: EventStoreState,
  action: EventAction
): EventStoreState {
  switch (action.type) {
    case "SET_EVENTS":
      return { ...state, events: action.payload };
    case "ADD_EVENT":
      return {
        ...state,
        events: [...state.events, action.payload],
        activeEventId: action.payload.id,
      };
    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case "DELETE_EVENT":
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.payload),
        activeEventId:
          state.activeEventId === action.payload
            ? state.events.find((e) => e.id !== action.payload)?.id || null
            : state.activeEventId,
      };
    case "SET_ACTIVE_EVENT":
      return { ...state, activeEventId: action.payload };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface EventStoreContextValue {
  state: EventStoreState;
  dispatch: React.Dispatch<EventAction>;
}

const EventStoreContext = createContext<EventStoreContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function EventStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(eventReducer, {
    events: MOCK_EVENTS,
    activeEventId: MOCK_EVENTS[0]?.id || null,
  });

  return (
    <EventStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </EventStoreContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useEventStore() {
  const context = useContext(EventStoreContext);
  if (!context) {
    throw new Error("useEventStore must be used within an EventStoreProvider");
  }
  return context;
}
