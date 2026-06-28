/**
 * Roles + access rules.
 *
 * Real auth (Supabase configured): a user's role is derived from their email via
 * configurable allow-lists (env vars below). Demo mode (no Supabase): a role is
 * chosen with the "Test as…" demo login, stored in the `finoy-role` cookie.
 *
 *   SUPER_ADMIN_EMAILS / ORGANIZER_EMAILS / HANDLER_EMAILS / BREEDER_EMAILS
 *   (comma-separated) — set in Netlify → Environment variables.
 *
 * Edge-safe (no heavy imports) so it can run in proxy.ts.
 */

export type AppRole =
  | "super-admin"
  | "organizer"
  | "handler"
  | "breeder"
  | "player";

export const ALL_ROLES: AppRole[] = [
  "super-admin",
  "organizer",
  "handler",
  "breeder",
  "player",
];

export const ROLE_LABEL: Record<AppRole, string> = {
  "super-admin": "Super Admin",
  organizer: "Organizer",
  handler: "Handler",
  breeder: "Breeder",
  player: "Player",
};

export const ROLE_ICON: Record<AppRole, string> = {
  "super-admin": "🛡️",
  organizer: "🏆",
  handler: "✋",
  breeder: "🧬",
  player: "🐟",
};

export function isAppRole(v: unknown): v is AppRole {
  return typeof v === "string" && (ALL_ROLES as string[]).includes(v);
}

const DEFAULT_SUPER_ADMIN = "mvnpflores.23148@gmail.com";

function emailsFromEnv(key: string): string[] {
  return (process.env[key] ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function superAdminEmails(): string[] {
  const fromEnv = emailsFromEnv("SUPER_ADMIN_EMAILS");
  return fromEnv.length ? fromEnv : [DEFAULT_SUPER_ADMIN];
}
export function organizerEmails(): string[] {
  return Array.from(
    new Set([...superAdminEmails(), ...emailsFromEnv("ORGANIZER_EMAILS")]),
  );
}
export function handlerEmails(): string[] {
  return emailsFromEnv("HANDLER_EMAILS");
}
export function breederEmails(): string[] {
  return emailsFromEnv("BREEDER_EMAILS");
}

export function roleForEmail(email?: string | null): AppRole {
  const e = (email ?? "").toLowerCase();
  if (!e) return "player";
  if (superAdminEmails().includes(e)) return "super-admin";
  if (organizerEmails().includes(e)) return "organizer";
  if (handlerEmails().includes(e)) return "handler";
  if (breederEmails().includes(e)) return "breeder";
  return "player";
}

/** Where each role lands after logging in. */
export function roleHome(role: AppRole): string {
  switch (role) {
    case "super-admin":
      return "/super-admin";
    case "organizer":
      return "/admin";
    case "handler":
      return "/handlers/me";
    case "player":
      return "/players/me";
    case "breeder":
      return "/rankings";
  }
}

/** Which role a path requires, or null if it's open to everyone. */
export function requiredAccessFor(
  path: string,
): "super-admin" | "admin" | "handler" | null {
  if (path === "/super-admin" || path.startsWith("/super-admin/"))
    return "super-admin";
  // /admin (exact) is open to any signed-in user — the page shows the Organizer
  // Console to approved organizers and an "apply to be an organizer" form to
  // everyone else. The action pages below stay organizer-only.
  if (path.startsWith("/admin/")) return "admin";
  if (path === "/handlers/me" || path.startsWith("/handlers/me/"))
    return "handler";
  return null;
}

export function roleSatisfies(
  role: AppRole | null,
  need: "super-admin" | "admin" | "handler",
): boolean {
  if (!role) return false;
  if (need === "super-admin") return role === "super-admin";
  if (need === "admin") return role === "super-admin" || role === "organizer";
  if (need === "handler") return role === "super-admin" || role === "handler";
  return false;
}

export function canAccessSuperAdmin(email?: string | null): boolean {
  return roleForEmail(email) === "super-admin";
}
export function canAccessAdmin(email?: string | null): boolean {
  const r = roleForEmail(email);
  return r === "super-admin" || r === "organizer";
}
