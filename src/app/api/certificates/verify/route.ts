import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { CsvRow, CanvasConfig } from "@/types";

export const dynamic = "force-dynamic";

// ─── IP-based Rate Limiter (sliding window, in-memory) ───────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30;  // max 30 requests per minute per IP

/** Tracks { count, windowStart } per IP address. */
const ipRequestMap = new Map<string, { count: number; windowStart: number }>();

function isAllowed(ip: string): boolean {
  const now = Date.now();

  // Periodic eviction of stale entries
  if (ipRequestMap.size % 100 === 0) {
    for (const [key, val] of ipRequestMap.entries()) {
      if (now - val.windowStart > RATE_LIMIT_WINDOW_MS) {
        ipRequestMap.delete(key);
      }
    }
  }

  const entry = ipRequestMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequestMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  entry.count += 1;
  return true;
}
// ─────────────────────────────────────────────────────────────────────────────

interface SanitizedEventPayload {
  id: string;
  eventName: string;
  category: string;
  eventDate: string;
  status: "Draft" | "Published";
  baseImageUrl: string;
  canvasConfigs: CanvasConfig[];
  csvData: CsvRow[];
}

interface MatchRecordResponse {
  event: SanitizedEventPayload;
  participant: CsvRow;
}

interface CachedEventData {
  id: string;
  event_name: string;
  category: string;
  event_date: string;
  status: string;
  canvas_configs: CanvasConfig[];
  csv_data: CsvRow[];
}

// In-memory cache for published events metadata and CSV (eliminates repeated DB round-trips)
let cachedPublishedEvents: {
  timestamp: number;
  events: CachedEventData[];
} | null = null;
const CACHE_TTL_MS = 60_000; // 60 seconds TTL

// In-memory cache for heavy base_image_url templates (fetched once on-demand per event)
const eventImageCache = new Map<string, string>();

/**
 * Fetches published events metadata and CSV data, utilizing an in-memory cache.
 * Excludes heavy base_image_url to ensure sub-second response times.
 */
async function getPublishedEvents(): Promise<CachedEventData[]> {
  const now = Date.now();
  if (
    cachedPublishedEvents &&
    now - cachedPublishedEvents.timestamp < CACHE_TTL_MS &&
    cachedPublishedEvents.events.length > 0
  ) {
    return cachedPublishedEvents.events;
  }

  const { data, error } = await supabase
    .from("events")
    .select("id, event_name, category, event_date, status, canvas_configs, csv_data")
    .eq("status", "Published")
    .order("created_at", { ascending: false });

  if (error) {
    if (cachedPublishedEvents?.events) {
      return cachedPublishedEvents.events;
    }
    throw error;
  }

  const events: CachedEventData[] = (data || []).map((row) => ({
    id: row.id,
    event_name: row.event_name,
    category: row.category || "Workshop",
    event_date: row.event_date || "",
    status: row.status || "Published",
    canvas_configs: row.canvas_configs || [],
    csv_data: Array.isArray(row.csv_data) ? row.csv_data : [],
  }));

  cachedPublishedEvents = {
    timestamp: now,
    events,
  };

  return events;
}

/**
 * Retrieves the base_image_url for a specific event on-demand, caching it in memory.
 */
async function getEventBaseImage(eventId: string): Promise<string> {
  if (eventImageCache.has(eventId)) {
    return eventImageCache.get(eventId) || "";
  }

  try {
    const { data } = await supabase
      .from("events")
      .select("base_image_url")
      .eq("id", eventId)
      .single();

    const imageUrl = data?.base_image_url || "";
    if (imageUrl) {
      eventImageCache.set(eventId, imageUrl);
    }
    return imageUrl;
  } catch (err) {
    console.error(`[Verify API] Error fetching image for event ${eventId}:`, err);
    return "";
  }
}

/**
 * POST /api/certificates/verify
 * Secure, ultra-fast certificate verification with IP rate limiting and two-phase caching.
 * - Rate limited per IP to prevent enumeration.
 * - Phase 1: In-memory/lightweight event CSV scan (sub-second response, zero heavy image transfer).
 * - Phase 2: On-demand template retrieval only for matched events.
 * - Returns ONLY the matching participant's record; zero other student PII exposed.
 */
export async function POST(req: NextRequest) {
  // ── Rate limit check ──────────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!isAllowed(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      }
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const body = await req.json();
    const { email, eventId } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Registered email address is required." },
        { status: 400 }
      );
    }

    const queryEmail = email.trim().toLowerCase();
    const isSpecificEvent = Boolean(
      eventId && typeof eventId === "string" && eventId !== "all" && eventId.trim() !== ""
    );

    // Phase 1: Retrieve lightweight published events (cached or lightweight Supabase query)
    let allPublishedEvents: CachedEventData[];
    try {
      allPublishedEvents = await getPublishedEvents();
    } catch (dbErr) {
      console.error("[API /api/certificates/verify] Supabase query error:", dbErr);
      return NextResponse.json(
        { error: "Failed to query certificate records. Please try again." },
        { status: 500 }
      );
    }

    // Filter to specific event if requested by the user on the dashboard
    const eventsToSearch = isSpecificEvent
      ? allPublishedEvents.filter((e) => e.id === eventId.trim())
      : allPublishedEvents;

    if (eventsToSearch.length === 0) {
      return NextResponse.json(
        { error: "No certificate found for the provided email." },
        { status: 404 }
      );
    }

    interface PendingMatch {
      event: CachedEventData;
      participant: CsvRow;
    }

    const pendingMatches: PendingMatch[] = [];

    // Scan through matching event records
    for (const evt of eventsToSearch) {
      for (const row of evt.csv_data) {
        const rowEmail = (
          row.email ||
          row.Email ||
          row.EMAIL ||
          ""
        )
          .toString()
          .trim()
          .toLowerCase();

        if (rowEmail === queryEmail) {
          pendingMatches.push({
            event: evt,
            participant: row,
          });
        }
      }
    }

    // If no matching participant found in the requested scope, return 404 instantly
    if (pendingMatches.length === 0) {
      return NextResponse.json(
        { error: "No certificate found for the provided email." },
        { status: 404 }
      );
    }

    // Phase 2: Resolve base_image_url ONLY for the matched events
    const matches: MatchRecordResponse[] = [];

    for (const match of pendingMatches) {
      const baseImageUrl = await getEventBaseImage(match.event.id);

      matches.push({
        event: {
          id: match.event.id,
          eventName: match.event.event_name,
          category: match.event.category || "Workshop",
          eventDate: match.event.event_date || "",
          status: (match.event.status || "Published") as "Draft" | "Published",
          baseImageUrl,
          canvasConfigs: match.event.canvas_configs || [],
          csvData: [], // Strictly empty - zero leakage of other students
        },
        participant: match.participant,
      });
    }

    return NextResponse.json({
      success: true,
      matches,
      match: matches[0],
    });
  } catch (err: unknown) {
    console.error("[API /api/certificates/verify] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error during certificate verification." },
      { status: 500 }
    );
  }
}
