/**
 * Data access for competitions. When Supabase is configured it reads/writes the
 * `competitions` table; otherwise it falls back to the in-memory mock data so
 * the app keeps working with zero setup. This is the pattern to extend to other
 * tables (teams, accounts, entries…) as Phase 1 progresses.
 *
 * SERVER ONLY — imported by Server Components, Route Handlers, Server Actions.
 */
import {
  competitions as mockCompetitions,
  getCompetition as mockGetCompetition,
  type Competition,
  type Category,
  type CompetitionLevel,
  type Region,
  type ShowSponsor,
} from "@/lib/data";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

interface CompetitionRow {
  slug: string;
  name: string;
  organizer: string;
  venue: string;
  city: string;
  region: string;
  date: string;
  registration_deadline: string | null;
  entry_fee: number;
  level: string;
  max_entries: number;
  entries: number;
  categories: Category[];
  status: string;
  poster: string;
  poster_image: string | null;
  ranking_counts: boolean;
  allow_judges: boolean;
  allow_team_members: boolean;
  live_url: string | null;
  judges: string[];
  judges_published: boolean;
  judging_started: boolean;
  sponsors: ShowSponsor[];
}

function rowToCompetition(r: CompetitionRow): Competition {
  return {
    slug: r.slug,
    name: r.name,
    organizer: r.organizer ?? "",
    venue: r.venue ?? "",
    city: r.city ?? "",
    region: (r.region as Region) ?? "Luzon",
    date: r.date,
    registrationDeadline: r.registration_deadline ?? r.date,
    entryFee: r.entry_fee ?? 0,
    level: (r.level as CompetitionLevel) ?? "Local",
    maxEntries: r.max_entries ?? 0,
    entries: r.entries ?? 0,
    categories: (r.categories ?? []) as Category[],
    status: (r.status as Competition["status"]) ?? "upcoming",
    poster: r.poster ?? "from-gold-deep via-ink to-ink",
    posterImage: r.poster_image ?? undefined,
    rankingCounts: r.ranking_counts ?? false,
    allowJudges: r.allow_judges ?? undefined,
    allowTeamMembers: r.allow_team_members ?? undefined,
    liveUrl: r.live_url ?? undefined,
    judges: r.judges ?? undefined,
    judgesPublished: r.judges_published ?? undefined,
    judgingStarted: r.judging_started ?? undefined,
    sponsors: r.sponsors ?? undefined,
  };
}

/** Map a Competition object to a DB row (used by create + seed). */
export function competitionToRow(c: Competition): CompetitionRow {
  return {
    slug: c.slug,
    name: c.name,
    organizer: c.organizer,
    venue: c.venue,
    city: c.city,
    region: c.region,
    date: c.date,
    registration_deadline: c.registrationDeadline ?? null,
    entry_fee: c.entryFee,
    level: c.level,
    max_entries: c.maxEntries,
    entries: c.entries,
    categories: c.categories,
    status: c.status,
    poster: c.poster,
    poster_image: c.posterImage ?? null,
    ranking_counts: c.rankingCounts,
    allow_judges: c.allowJudges ?? false,
    allow_team_members: c.allowTeamMembers ?? true,
    live_url: c.liveUrl ?? null,
    judges: c.judges ?? [],
    judges_published: c.judgesPublished ?? false,
    judging_started: c.judgingStarted ?? false,
    sponsors: c.sponsors ?? [],
  };
}

export async function getCompetitions(): Promise<Competition[]> {
  if (!isSupabaseConfigured()) return mockCompetitions;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("competitions")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw error;
    return (data as CompetitionRow[]).map(rowToCompetition);
  } catch (e) {
    console.warn("[db] competitions read failed — using mock:", e);
    return mockCompetitions;
  }
}

export async function getCompetitionBySlug(
  slug: string,
): Promise<Competition | undefined> {
  if (!isSupabaseConfigured()) return mockGetCompetition(slug);
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("competitions")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToCompetition(data as CompetitionRow) : undefined;
  } catch (e) {
    console.warn("[db] competition read failed — using mock:", e);
    return mockGetCompetition(slug);
  }
}

export async function createCompetition(c: Competition): Promise<void> {
  if (!isSupabaseConfigured()) return; // mock mode: nothing to persist
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("competitions")
    .upsert(competitionToRow(c), { onConflict: "slug" });
  if (error) throw new Error(error.message);
}
