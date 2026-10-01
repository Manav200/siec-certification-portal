import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/events
 * Public endpoint to list published events metadata.
 * STRICT SECURITY: Only selects public fields (id, event_name, category, event_date, status, base_image_url, canvas_configs).
 * NEVER includes csv_data, admin_id, or creator_email to eliminate student PII exposure.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      "";

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
      return NextResponse.json({ events: [] });
    }

    // Query ONLY public metadata columns - exclude csv_data, admin_id, creator_email
    const { data, error } = await supabase
      .from("events")
      .select("id, event_name, category, event_date, status, base_image_url, canvas_configs")
      .eq("status", "Published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[API /api/events] Database query error:", error);
      return NextResponse.json(
        { error: "Failed to retrieve published events." },
        { status: 500 }
      );
    }

    // Map database columns to application model with empty csvData (Zero PII transmitted)
    const events = (data || []).map((row) => ({
      id: row.id,
      eventName: row.event_name,
      category: row.category || "Workshop",
      eventDate: row.event_date || "",
      status: (row.status || "Published") as "Draft" | "Published",
      baseImageUrl: row.base_image_url || "",
      canvasConfigs: row.canvas_configs || [],
      csvData: [], // Explicitly empty array to ensure zero PII leakage
    }));

    return NextResponse.json(
      { events },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: unknown) {
    console.error("[API /api/events] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
