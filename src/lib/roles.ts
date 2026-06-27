/**
 * Role resolution by email. Until accounts live in the database, access is
 * controlled by configurable allow-lists:
 *   - SUPER_ADMIN_EMAILS  (comma-separated env var) — full platform control
 *   - ORGANIZER_EMAILS    (comma-separated env var) — show organizers
 * Set these in Netlify → Environment variables. Defaults to the owner email.
 *
 * Edge-safe (no heavy imports) so it can run in proxy.ts. Functions read env at
 * call time so changes take effect without a rebuild of this module.
 */

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
  // The Super Admin can also organize, so they're always included.
  return Array.from(
    new Set([...superAdminEmails(), ...emailsFromEnv("ORGANIZER_EMAILS")]),
  );
}

export type AppRole = "super-admin" | "organizer" | "member";

export function roleForEmail(email?: string | null): AppRole {
  const e = (email ?? "").toLowerCase();
  if (!e) return "member";
  if (superAdminEmails().includes(e)) return "super-admin";
  if (organizerEmails().includes(e)) return "organizer";
  return "member";
}

export function canAccessSuperAdmin(email?: string | null): boolean {
  return roleForEmail(email) === "super-admin";
}

export function canAccessAdmin(email?: string | null): boolean {
  const r = roleForEmail(email);
  return r === "super-admin" || r === "organizer";
}
