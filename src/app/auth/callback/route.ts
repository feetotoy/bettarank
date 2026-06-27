import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Exchange the OAuth / email-confirmation `code` for a session, then redirect.
 * Add this URL to Supabase → Authentication → URL Configuration → Redirect URLs:
 *   http://localhost:3000/auth/callback  and  https://<your-site>/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
