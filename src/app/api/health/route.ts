import { NextResponse } from "next/server";

/**
 * Lightweight health/diagnostics endpoint — handy for confirming a Netlify
 * deploy is live and whether the Supabase env vars are wired, without exposing
 * any secret values. Hit /api/health after deploying.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    env: process.env.NODE_ENV,
    supabaseConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  });
}
