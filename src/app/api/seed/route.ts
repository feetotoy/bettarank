import { NextResponse } from "next/server";
import { competitions } from "@/lib/data";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { competitionToRow } from "@/lib/db/competitions";

/**
 * POST /api/seed — load the sample competitions into Supabase (upsert by slug).
 * Optional: skip it to test the empty → populate flow from scratch. Call once:
 *   curl -X POST https://<your-site>/api/seed
 *
 * Guard this (or delete it) before a real launch — it's a dev/test convenience.
 */
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured (set the env vars first)." },
      { status: 400 },
    );
  }
  const supabase = createAdminClient();
  const rows = competitions.map(competitionToRow);
  const { error } = await supabase
    .from("competitions")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, seeded: rows.length });
}
