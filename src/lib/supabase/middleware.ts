import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthConfigured } from "./config";
import {
  isAppRole,
  requiredAccessFor,
  roleForEmail,
  roleSatisfies,
  type AppRole,
} from "@/lib/roles";

/**
 * Refreshes the Supabase auth session and enforces role-based access on
 * /admin, /super-admin, and /handlers/me.
 *  - Real auth: role comes from the signed-in user's email; always enforced.
 *  - Demo mode: role comes from the `finoy-role` cookie ("Test as…"); enforced
 *    only once a role is chosen (no cookie = open browsing).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const need = requiredAccessFor(path);

  let role: AppRole | null = null;
  let loggedIn = false;
  let enforce = false;

  if (isAuthConfigured()) {
    enforce = true;
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value),
              );
              response = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options),
              );
            },
          },
        },
      );
      const {
        data: { user },
      } = await supabase.auth.getUser();
      loggedIn = !!user;
      role = user ? roleForEmail(user.email) : null;
    } catch {
      // Network/config hiccup — don't break the site.
      return response;
    }
  } else {
    // Demo mode: a role is only enforced once explicitly chosen.
    const cookie = request.cookies.get("finoy-role")?.value;
    role = isAppRole(cookie) ? cookie : null;
    loggedIn = !!role;
    enforce = !!role; // no demo role → leave everything open
  }

  if (need && enforce && !roleSatisfies(role, need)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    if (loggedIn) url.searchParams.set("denied", need);
    return NextResponse.redirect(url);
  }

  return response;
}
