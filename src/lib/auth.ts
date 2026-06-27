import { createClient } from "@/lib/supabase/server";
import { isAuthConfigured } from "@/lib/supabase/config";

/**
 * The signed-in Supabase user (or null) — for Server Components / layouts.
 * Returns null in open/demo mode (no Supabase), so callers degrade gracefully.
 */
export async function getCurrentUser() {
  if (!isAuthConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
}
