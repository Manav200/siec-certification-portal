"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  CertificateEvent,
  EventAction,
  EventStoreState,
} from "@/types";

// Public published cache storage key for attendee certificate lookup
const PUBLIC_PUBLISHED_EVENTS_KEY = "siec_public_published_events";

// Initial state (clean slate, zero shared data)
const INITIAL_STATE: EventStoreState = {
  events: [],
  activeEventId: null,
};

// ─── Reducer ────────────────────────────────────────────────────────────────

function eventReducer(
  state: EventStoreState,
  action: EventAction
): EventStoreState {
  switch (action.type) {
    case "SET_EVENTS":
      return {
        ...state,
        events: action.payload,
        activeEventId:
          action.payload.length > 0
            ? action.payload.some((e) => e.id === state.activeEventId)
              ? state.activeEventId
              : action.payload[0].id
            : null,
      };
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
      const remaining = state.events.filter((e) => e.id !== action.payload);
      return {
        ...state,
        events: remaining,
        activeEventId:
          state.activeEventId === action.payload
            ? remaining[0]?.id || null
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

// ─── Provider with Isolated Multi-Tenant Admin Storage ──────────────────────

export function EventStoreProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(eventReducer, INITIAL_STATE);
  const currentAdminUid = useRef<string | null>(null);

  // 1. Data Isolation Lifecycle: Load only the data belonging to the active context
  useEffect(() => {
    if (authLoading) return;

    let isSubscribed = true;

    async function loadIsolatedEvents() {
      // SCENARIO A: Authenticated Administrator
      // Every individual admin has their own isolated workspace (events where adminId == user.uid)
      if (user && isAdmin) {
        currentAdminUid.current = user.uid;
        const userStorageKey = `siec_events_${user.uid}`;

        // 1. Check Cloud Firestore for this specific admin's events
        if (db) {
          try {
            const q = query(
              collection(db, "events"),
              where("adminId", "==", user.uid)
            );
            const querySnap = await getDocs(q);
            const adminEvents: CertificateEvent[] = [];
            querySnap.forEach((docSnap) => {
              adminEvents.push(docSnap.data() as CertificateEvent);
            });

            if (isSubscribed) {
              if (adminEvents.length > 0) {
                dispatch({ type: "SET_EVENTS", payload: adminEvents });
                try {
                  localStorage.setItem(userStorageKey, JSON.stringify(adminEvents));
                } catch {}
                return;
              }
            }
          } catch (err) {
            console.warn("Firestore query error for admin events:", err);
          }
        }

        // 2. Check Isolated User-Scoped Local Storage fallback
        if (typeof window !== "undefined") {
          try {
            const saved = localStorage.getItem(userStorageKey);
            if (saved && isSubscribed) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                dispatch({ type: "SET_EVENTS", payload: parsed });
                return;
              }
            }
          } catch {}
        }

        // 3. Brand New Admin Account: start with clean slate (empty list, NO leak of other admins' data)
        if (isSubscribed) {
          dispatch({ type: "SET_EVENTS", payload: [] });
        }
      } else {
        // SCENARIO B: Public Participant Portal (Not logged in as Admin)
        // Public portal only needs published events to let attendees download their certificates
        currentAdminUid.current = null;

        if (db) {
          try {
            const q = query(
              collection(db, "events"),
              where("status", "==", "Published")
            );
            const querySnap = await getDocs(q);
            const publishedEvents: CertificateEvent[] = [];
            querySnap.forEach((docSnap) => {
              publishedEvents.push(docSnap.data() as CertificateEvent);
            });

            if (isSubscribed && publishedEvents.length > 0) {
              dispatch({ type: "SET_EVENTS", payload: publishedEvents });
              try {
                localStorage.setItem(
                  PUBLIC_PUBLISHED_EVENTS_KEY,
                  JSON.stringify(publishedEvents)
                );
              } catch {}
              return;
            }
          } catch {}
        }

        // Fallback to cached published events for public portal
        if (typeof window !== "undefined") {
          try {
            const cached = localStorage.getItem(PUBLIC_PUBLISHED_EVENTS_KEY);
            if (cached && isSubscribed) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) {
                dispatch({ type: "SET_EVENTS", payload: parsed });
                return;
              }
            }
          } catch {}
        }

        if (isSubscribed) {
          dispatch({ type: "SET_EVENTS", payload: [] });
        }
      }
    }

    loadIsolatedEvents();

    return () => {
      isSubscribed = false;
    };
  }, [user?.uid, isAdmin, authLoading]);

  // 2. Intercepted dispatch that guarantees tenant isolation and persistent synchronization
  const secureDispatch: React.Dispatch<EventAction> = (action) => {
    // Immediate in-memory update
    dispatch(action);

    // If an admin is authenticated, persist strictly to their isolated storage
    if (user && user.uid && isAdmin) {
      const userStorageKey = `siec_events_${user.uid}`;

      if (action.type === "ADD_EVENT") {
        const eventToSave: CertificateEvent = {
          ...action.payload,
          adminId: user.uid,
          creatorEmail: user.email || "",
          updatedAt: new Date().toISOString(),
        };

        try {
          const current = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
          const updated = [
            ...current.filter((e: CertificateEvent) => e.id !== eventToSave.id),
            eventToSave,
          ];
          localStorage.setItem(userStorageKey, JSON.stringify(updated));

          if (eventToSave.status === "Published") {
            const pub = JSON.parse(localStorage.getItem(PUBLIC_PUBLISHED_EVENTS_KEY) || "[]");
            const updatedPub = [
              ...pub.filter((e: CertificateEvent) => e.id !== eventToSave.id),
              eventToSave,
            ];
            localStorage.setItem(PUBLIC_PUBLISHED_EVENTS_KEY, JSON.stringify(updatedPub));
          }
        } catch {}

        if (db) {
          setDoc(doc(db, "events", eventToSave.id), eventToSave, { merge: true }).catch((err) =>
            console.warn("Firestore save failed:", err)
          );
        }
      } else if (action.type === "UPDATE_EVENT") {
        const eventToSave: CertificateEvent = {
          ...action.payload,
          adminId: user.uid,
          creatorEmail: user.email || "",
          updatedAt: new Date().toISOString(),
        };

        try {
          const current = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
          const updated = current.map((e: CertificateEvent) =>
            e.id === eventToSave.id ? eventToSave : e
          );
          localStorage.setItem(userStorageKey, JSON.stringify(updated));

          // Sync public published cache
          const pub = JSON.parse(localStorage.getItem(PUBLIC_PUBLISHED_EVENTS_KEY) || "[]");
          let updatedPub: CertificateEvent[];
          if (eventToSave.status === "Published") {
            updatedPub = [
              ...pub.filter((e: CertificateEvent) => e.id !== eventToSave.id),
              eventToSave,
            ];
          } else {
            updatedPub = pub.filter((e: CertificateEvent) => e.id !== eventToSave.id);
          }
          localStorage.setItem(PUBLIC_PUBLISHED_EVENTS_KEY, JSON.stringify(updatedPub));
        } catch {}

        if (db) {
          setDoc(doc(db, "events", eventToSave.id), eventToSave, { merge: true }).catch((err) =>
            console.warn("Firestore update failed:", err)
          );
        }
      } else if (action.type === "DELETE_EVENT") {
        const eventId = action.payload;

        try {
          const current = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
          const updated = current.filter((e: CertificateEvent) => e.id !== eventId);
          localStorage.setItem(userStorageKey, JSON.stringify(updated));

          const pub = JSON.parse(localStorage.getItem(PUBLIC_PUBLISHED_EVENTS_KEY) || "[]");
          const updatedPub = pub.filter((e: CertificateEvent) => e.id !== eventId);
          localStorage.setItem(PUBLIC_PUBLISHED_EVENTS_KEY, JSON.stringify(updatedPub));
        } catch {}

        if (db) {
          deleteDoc(doc(db, "events", eventId)).catch((err) =>
            console.warn("Firestore delete failed:", err)
          );
        }
      }
    }
  };

  return (
    <EventStoreContext.Provider value={{ state, dispatch: secureDispatch }}>
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
