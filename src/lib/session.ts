import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { isAuthConfigured } from "@/lib/supabase/config";
import { isAppRole, roleForEmail, type AppRole } from "@/lib/roles";

export interface Session {
  loggedIn: boolean;
  email: string | null;
  role: AppRole | null;
  demo: boolean; // true when acting via the demo "Test as…" login
}

/**
 * The current session for Server Components / layouts. With Supabase configured
 * it reflects the real signed-in user + their email-based role. Otherwise it
 * reads the demo `finoy-role` cookie (the "Test as…" login).
 */
export async function getSession(): Promise<Session> {
  if (isAuthConfigured()) {
    const user = await getCurrentUser();
    return {
      loggedIn: !!user,
      email: user?.email ?? null,
      role: user ? roleForEmail(user.email) : null,
      demo: false,
    };
  }
  const cookie = (await cookies()).get("finoy-role")?.value;
  const role = isAppRole(cookie) ? cookie : null;
  return {
    loggedIn: !!role,
    email: role ? `demo+${role}@finoy.local` : null,
    role,
    demo: true,
  };
}
