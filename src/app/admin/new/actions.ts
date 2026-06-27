"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  CATEGORIES,
  type Competition,
  type CompetitionLevel,
  type Region,
} from "@/lib/data";
import { createCompetition } from "@/lib/db/competitions";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function str(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}
function int(fd: FormData, k: string, fallback = 0): number {
  const n = Number(str(fd, k));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}
function checked(fd: FormData, k: string): boolean {
  return fd.get(k) != null; // a checkbox only appears in FormData when ticked
}

/**
 * Server action behind the "Create Competition" form. Persists to Supabase when
 * configured (otherwise a no-op, matching the mock demo), then redirects to the
 * organizer console where the new show appears.
 */
export async function createCompetitionAction(formData: FormData): Promise<void> {
  const name = str(formData, "name") || "Untitled Show";

  const levelRaw = str(formData, "level");
  const level =
    (levelRaw === "__custom" ? str(formData, "levelCustom") : levelRaw) ||
    "Local";

  const orgRaw = str(formData, "organizer");
  const organizer =
    (orgRaw === "__other" ? str(formData, "organizerCustom") : orgRaw) ||
    "FINOY";

  const date = str(formData, "date") || "2026-12-31";

  const comp: Competition = {
    slug: `${slugify(name)}-${Date.now().toString(36).slice(-4)}`,
    name,
    organizer,
    venue: str(formData, "venue"),
    city: str(formData, "city"),
    region: ((str(formData, "region") || "Luzon") as Region),
    date,
    registrationDeadline: str(formData, "registrationDeadline") || date,
    entryFee: int(formData, "entryFee", 0),
    level: level as CompetitionLevel,
    maxEntries: int(formData, "maxEntries", 0),
    entries: 0,
    categories: [...CATEGORIES],
    status: "upcoming",
    poster: "from-gold-deep via-ink to-ink",
    rankingCounts: checked(formData, "rankingCounts"),
    allowJudges: checked(formData, "allowJudges"),
    allowTeamMembers: checked(formData, "allowTeamMembers"),
    liveUrl: str(formData, "liveUrl") || undefined,
  };

  await createCompetition(comp);
  revalidatePath("/admin");
  revalidatePath("/competitions");
  redirect("/admin");
}
