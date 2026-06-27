import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthConfigured } from "./config";

// Routes that require a signed-in user (only enforced when auth is configured).
const PROTECTED = ["/admin", "/super-admin"];

/**
 * Refreshes the Supabase auth session cookie on each request, and redirects
 * unauthenticated users away from protected routes. No-ops in open/demo mode.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isAuthConfigured()) return response;

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

    const path = request.nextUrl.pathname;
    const isProtected = PROTECTED.some(
      (p) => path === p || path.startsWith(p + "/"),
    );
    if (!user && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  } catch {
    // Network/config hiccup — don't break the site, just continue.
  }
  return response;
}
