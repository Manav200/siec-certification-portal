import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { CsvRow, CanvasConfig } from "@/types";

export const dynamic = "force-dynamic";

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

/**
 * POST /api/certificates/verify
 * Secure server-side certificate verification.
 * Searches database csv_data for the provided email and returns ONLY the single matching
 * participant record and canvas configurations.
 * Full student csv_data is NEVER returned to DevTools or the client.
 */
export async function POST(req: NextRequest) {
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

    // Build database query for published events
    let query = supabase
      .from("events")
      .select("id, event_name, category, event_date, status, base_image_url, canvas_configs, csv_data")
      .eq("status", "Published");

    if (isSpecificEvent) {
      query = query.eq("id", eventId.trim());
    }

    const { data: events, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("[API /api/certificates/verify] Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to query certificate records. Please try again." },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: "No certificate found for the provided email." },
        { status: 404 }
      );
    }

    const matches: MatchRecordResponse[] = [];

    // Server-side scan through matching event records
    for (const evt of events) {
      const csvData: CsvRow[] = Array.isArray(evt.csv_data) ? evt.csv_data : [];

      for (const row of csvData) {
        const rowEmail = (
          row.email ||
          row.Email ||
          row.EMAIL ||
          row["Email Address"] ||
          row["email address"] ||
          row["Email ID"] ||
          row["email id"] ||
          row["Mail ID"] ||
          row["mail id"] ||
          row["Mail"] ||
          row["mail"] ||
          ""
        )
          .toString()
          .trim()
          .toLowerCase();

        if (rowEmail === queryEmail) {
          // Construct sanitized payload: ONLY include the matching participant's row
          matches.push({
            event: {
              id: evt.id,
              eventName: evt.event_name,
              category: evt.category || "Workshop",
              eventDate: evt.event_date || "",
              status: (evt.status || "Published") as "Draft" | "Published",
              baseImageUrl: evt.base_image_url || "",
              canvasConfigs: evt.canvas_configs || [],
              csvData: [], // Strictly empty - zero leakage of other students
            },
            participant: row,
          });
        }
      }
    }

    if (matches.length === 0) {
      return NextResponse.json(
        { error: "No certificate found for the provided email." },
        { status: 404 }
      );
    }

    // Return sanitized match data containing ONLY the verified participant's records
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
