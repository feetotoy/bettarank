/**
 * FINOY — mock data layer.
 *
 * Stand-in for the PostgreSQL-backed API. Everything here is deterministic so
 * the UI renders identically on server and client. Swap these functions for
 * real `fetch` / database calls once the backend exists.
 */

export type CompetitionLevel =
  | "Local"
  | "Regional"
  | "National"
  | "Grand Championship";

export type Region =
  | "Luzon"
  | "Visayas"
  | "Mindanao"
  | "NCR";

export type Category =
  | "HMPK"
  | "Halfmoon"
  | "Crowntail"
  | "Plakat"
  | "Giant"
  | "Female"
  | "Wild Betta"
  | "OCV HMPK";

export const CATEGORIES: Category[] = [
  "HMPK",
  "Halfmoon",
  "Crowntail",
  "Plakat",
  "Giant",
  "Female",
  "Wild Betta",
  "OCV HMPK",
];

/**
 * OCV classes use royalty titles: 1st place is the "Prince". Every other
 * category uses 1st / 2nd / 3rd. OUT is the non-placing result everywhere.
 */
export function isOCV(category: string): boolean {
  return /ocv/i.test(category);
}

export function placementsFor(category: string): string[] {
  return isOCV(category)
    ? ["Prince", "2nd", "3rd", "OUT"]
    : ["1st", "2nd", "3rd", "OUT"];
}

/* ------------------------------------------------------------------ */
/*  Official divisions (pre-loaded for shows; organizers add/remove)   */
/* ------------------------------------------------------------------ */

export type DivisionGroup = "Regular" | "Junior" | "Open";

export interface OfficialDivision {
  name: string;
  abbr?: string;
  group: DivisionGroup;
}

export const OFFICIAL_DIVISIONS: OfficialDivision[] = [
  { name: "Halfmoon Division", abbr: "HM", group: "Regular" },
  { name: "Doubletail Halfmoon Division", abbr: "DTHM", group: "Regular" },
  { name: "Crowntail Division", abbr: "CT", group: "Regular" },
  { name: "Halfmoon Plakat Division", abbr: "HMPK", group: "Regular" },
  { name: "OCV HMPK Division", abbr: "OCV HMPK", group: "Regular" },
  { name: "Double Tail Plakat Division", abbr: "DTPK", group: "Regular" },
  { name: "Giant HMPK Division", abbr: "GIANT HMPK", group: "Regular" },
  { name: "Junior Division", group: "Junior" },
  { name: "Junior Giant Division", group: "Junior" },
  { name: "Junior OCV HMPK Division", group: "Junior" },
  { name: "Female Division", group: "Open" },
  { name: "Other Form Variation Division", group: "Open" },
  { name: "Form and Finnage Division", group: "Open" },
  { name: "Wild Betta Division", group: "Open" },
  { name: "Anak Size", group: "Open" },
];

/* ------------------------------------------------------------------ */
/*  Classes offered per division (organizer-defined; used in register)  */
/* ------------------------------------------------------------------ */

export interface DivisionClass {
  code: string; // bench-code prefix, e.g. "A1"
  name: string; // descriptive class, e.g. "Solid Red — Male"
}

// Bench-code prefixes for the core divisions (A=Halfmoon, B=HMPK, C=Crowntail…).
const DIVISION_PREFIX: Record<string, string> = {
  "Halfmoon Division": "A",
  "Halfmoon Plakat Division": "B",
  "Crowntail Division": "C",
  "OCV HMPK Division": "OCV",
};
// The classes an organizer offers under each division.
const DIVISION_CLASS_NAMES: Record<string, string[]> = {
  "Halfmoon Division": ["Solid Red — Male", "Solid Blue — Male", "Multicolor — Male", "Butterfly — Male", "Marble — Male", "Female"],
  "Halfmoon Plakat Division": ["Solid — Male", "Fancy — Male", "Koi & Galaxy — Male", "Nemo — Male", "Black & Copper — Male", "Female"],
  "Crowntail Division": ["Solid — Male", "Bicolor — Male", "Multicolor — Male", "Marble — Male", "Fancy — Male", "Female"],
  "OCV HMPK Division": ["Light Bicolor", "Dark Bicolor", "Multicolor"],
};
const GENERIC_CLASS_NAMES = ["Solid — Male", "Bicolor — Male", "Multicolor — Male", "Marble — Male", "Female"];

function divisionPrefix(name: string): string {
  if (DIVISION_PREFIX[name]) return DIVISION_PREFIX[name];
  const d = OFFICIAL_DIVISIONS.find((x) => x.name === name);
  if (d?.abbr) return d.abbr.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 5);
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 3) || "X"
  );
}

// The classes available under a division (organizer-created). Players pick from
// these in registration instead of typing a class code.
export function divisionClasses(divisionName: string): DivisionClass[] {
  const prefix = divisionPrefix(divisionName);
  const names = DIVISION_CLASS_NAMES[divisionName] ?? GENERIC_CLASS_NAMES;
  return names.map((name, i) => ({ code: `${prefix}${i + 1}`, name }));
}

// A sponsor of a specific show — organizer-added, shown on the public page.
export interface ShowSponsor {
  id: string;
  name: string;
  logo?: string; // uploaded logo (data URL in this mock)
  tier: "major" | "minor";
}

export interface Competition {
  slug: string;
  name: string;
  organizer: string;
  venue: string;
  city: string;
  region: Region;
  date: string; // ISO
  registrationDeadline: string; // ISO
  entryFee: number; // PHP
  level: CompetitionLevel;
  maxEntries: number;
  entries: number;
  categories: Category[];
  status: "upcoming" | "live" | "completed";
  poster: string; // gradient token (fallback backdrop)
  posterImage?: string; // organizer-uploaded portrait poster
  rankingCounts: boolean; // organizer declares if it feeds national rankings
  // Participation policy set by the organizing team:
  allowJudges?: boolean; // may official judges also compete? (default: no)
  allowTeamMembers?: boolean; // may the organizing team's own members compete? (default: yes)
  liveUrl?: string; // organizer's livestream link (FB / YouTube) viewers can open
  judges?: string[]; // the show's judge panel (names)
  judgesPublished?: boolean; // whether judge names are shown on the public page
  judgingStarted?: boolean; // organizer started judging — locks registration; only organizers reclass
  sponsors?: ShowSponsor[]; // organizer-added show sponsors (shown on the public page)
}

export interface RankedFish {
  id: string;
  name: string;
  strain: string;
  category: Category;
  breeder: string;
  owner: string;
  team: string;
  region: Region;
  points: number;
  previousRank: number;
  competitions: number;
  championships: number;
  winRate: number; // 0-100
}

export interface Breeder {
  id: string;
  name: string;
  farm: string;
  region: Region;
  points: number;
  previousRank: number;
  fish: number;
  championships: number;
  winRate: number;
  socials?: Socials;
}

export interface Team {
  id: string;
  name: string;
  region: Region;
  points: number;
  previousRank: number;
  members: number;
  championships: number;
}

export interface Handler {
  id: string;
  name: string;
  alias: string;
  region: Region;
  points: number;
  previousRank: number;
  fishHandled: number;
  benchAccuracy: number; // 0-100
  socials?: Socials;
}

/* ------------------------------------------------------------------ */
/*  Competitions                                                       */
/* ------------------------------------------------------------------ */

export const competitions: Competition[] = [
  {
    slug: "national-betta-grand-championship-2026",
    name: "National Betta Grand Championship 2026",
    organizer: "FINOY Federation",
    venue: "SMX Convention Center",
    city: "Pasay City",
    region: "NCR",
    date: "2026-07-18",
    registrationDeadline: "2026-07-10",
    entryFee: 350,
    level: "Grand Championship",
    maxEntries: 1200,
    entries: 1043,
    categories: CATEGORIES,
    status: "upcoming",
    poster: "from-gold-deep via-ink to-ink",
    rankingCounts: true,
  },
  {
    slug: "luzon-regional-open-2026",
    name: "Luzon Regional Open 2026",
    organizer: "Northern Betta Society",
    venue: "Robinsons Place Atrium",
    city: "Baguio City",
    region: "Luzon",
    date: "2026-06-28",
    registrationDeadline: "2026-06-22",
    entryFee: 200,
    level: "Regional",
    maxEntries: 600,
    entries: 512,
    categories: ["HMPK", "Halfmoon", "Crowntail", "Plakat", "Female"],
    status: "upcoming",
    poster: "from-blue-flag via-ink to-ink",
    rankingCounts: true,
  },
  {
    slug: "cebu-city-betta-showdown-2026",
    name: "Cebu City Betta Showdown",
    organizer: "Visayas Aquatics Guild",
    venue: "Ayala Center Cebu",
    city: "Cebu City",
    region: "Visayas",
    date: "2026-06-24",
    registrationDeadline: "2026-06-20",
    entryFee: 180,
    level: "Regional",
    maxEntries: 500,
    entries: 478,
    categories: ["HMPK", "Plakat", "Giant", "Halfmoon", "OCV HMPK"],
    status: "live",
    poster: "from-blue via-ink to-ink",
    rankingCounts: true,
    liveUrl: "https://www.facebook.com/FinoyShows/live",
    judges: ["Luis Enrera", "Joshua Ong", "Hon. Ramon Aquino"],
    judgesPublished: true,
    judgingStarted: true,
    sponsors: [
      { id: "sp-1", name: "AquaPro PH", tier: "major" },
      { id: "sp-2", name: "BettaGuard", tier: "major" },
      { id: "sp-3", name: "Tropica Feeds", tier: "minor" },
      { id: "sp-4", name: "BlueLagoon Tanks", tier: "minor" },
      { id: "sp-5", name: "Pinoy Pet Supply", tier: "minor" },
    ],
  },
  {
    slug: "davao-betta-cup-2026",
    name: "Davao Betta Cup",
    organizer: "Mindanao Betta Keepers",
    venue: "SM Lanang Premier",
    city: "Davao City",
    region: "Mindanao",
    date: "2026-08-09",
    registrationDeadline: "2026-08-01",
    entryFee: 220,
    level: "Regional",
    maxEntries: 450,
    entries: 187,
    categories: ["HMPK", "Plakat", "Giant", "Wild Betta"],
    status: "upcoming",
    poster: "from-red-flag via-ink to-ink",
    rankingCounts: false,
  },
  {
    slug: "metro-manila-local-league-r4-2026",
    name: "Metro Manila Local League — Round 4",
    organizer: "Quezon City Betta Club",
    venue: "Trinoma Activity Center",
    city: "Quezon City",
    region: "NCR",
    date: "2026-07-05",
    registrationDeadline: "2026-07-02",
    entryFee: 120,
    level: "Local",
    maxEntries: 250,
    entries: 96,
    categories: ["HMPK", "Plakat", "Female"],
    status: "upcoming",
    poster: "from-red via-ink to-ink",
    rankingCounts: false,
    allowJudges: true,
    allowTeamMembers: true,
  },
  {
    slug: "iloilo-heritage-betta-classic-2026",
    name: "Iloilo Heritage Betta Classic",
    organizer: "Western Visayas Betta League",
    venue: "Festive Walk Mall",
    city: "Iloilo City",
    region: "Visayas",
    date: "2026-05-31",
    registrationDeadline: "2026-05-25",
    entryFee: 180,
    level: "Regional",
    maxEntries: 400,
    entries: 400,
    categories: ["HMPK", "Halfmoon", "Crowntail", "Plakat"],
    status: "completed",
    poster: "from-gold-deep via-ink to-ink",
    rankingCounts: true,
  },
];

export function getCompetition(slug: string): Competition | undefined {
  return competitions.find((c) => c.slug === slug);
}

/* ------------------------------------------------------------------ */
/*  Rankings                                                           */
/* ------------------------------------------------------------------ */

// Shared helpers for the real-data leaderboards below.
const REGIONS_4: Region[] = ["Luzon", "Visayas", "Mindanao", "NCR"];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Social handles a competitor/team can link so they're easy to reach.
export interface Socials {
  facebook?: string;
  tiktok?: string;
  instagram?: string;
}

// Deterministic mock handles so every profile is reachable. A varied subset per
// entity (not everyone links all three). Swap for stored values once persisted.
function socialsFor(seed: string, displayName: string): Socials {
  const handle = slugify(displayName).replace(/-/g, "");
  const h = showHash(seed);
  // Facebook is near-universal here; TikTok / Instagram vary per entity. Bits
  // are shifted so the three choices are independent.
  const s: Socials = { facebook: `https://facebook.com/${handle}` };
  if ((h >> 2) % 3 !== 0) s.tiktok = `https://tiktok.com/@${handle}`;
  if ((h >> 4) % 2 === 0) s.instagram = `https://instagram.com/${handle}`;
  return s;
}

export const fishRankings: RankedFish[] = [
  {
    id: "BRPH-F-00021",
    name: "Imperial Dragon",
    strain: "Super Red HMPK",
    category: "HMPK",
    breeder: "Dauntless",
    owner: "Martin Ozaeta",
    team: "Dauntless",
    region: "Luzon",
    points: 1620,
    previousRank: 1,
    competitions: 17,
    championships: 11,
    winRate: 78,
  },
  {
    id: "BRPH-F-00007",
    name: "Giant Samurai",
    strain: "Black Samurai Giant",
    category: "Giant",
    breeder: "Kasai",
    owner: "Mart Ruzzel Matudio",
    team: "Kasai",
    region: "Mindanao",
    points: 1450,
    previousRank: 3,
    competitions: 15,
    championships: 8,
    winRate: 73,
  },
  {
    id: "BRPH-F-00114",
    name: "Galaxy Koi",
    strain: "Nemo Galaxy Plakat",
    category: "Plakat",
    breeder: "Krakens PH",
    owner: "Kate Dalaguit",
    team: "Krakens PH",
    region: "Visayas",
    points: 1388,
    previousRank: 2,
    competitions: 14,
    championships: 7,
    winRate: 71,
  },
  {
    id: "BRPH-F-00056",
    name: "Lunar Halfmoon",
    strain: "Blue Marble Halfmoon",
    category: "Halfmoon",
    breeder: "Dauntless",
    owner: "Martin Ozaeta",
    team: "Dauntless",
    region: "Luzon",
    points: 1255,
    previousRank: 5,
    competitions: 13,
    championships: 6,
    winRate: 69,
  },
  {
    id: "BRPH-F-00088",
    name: "Crimson Crown",
    strain: "Red Crowntail",
    category: "Crowntail",
    breeder: "Outlaws",
    owner: "Joseph Ramos",
    team: "Outlaws",
    region: "Luzon",
    points: 1190,
    previousRank: 4,
    competitions: 12,
    championships: 6,
    winRate: 66,
  },
  {
    id: "BRPH-F-00132",
    name: "Emerald Empress",
    strain: "Green Dragon Female",
    category: "Female",
    breeder: "TNBH",
    owner: "Casey Alana",
    team: "TNBH",
    region: "Visayas",
    points: 1102,
    previousRank: 7,
    competitions: 11,
    championships: 5,
    winRate: 64,
  },
  {
    id: "BRPH-F-00201",
    name: "Wild Mahachai",
    strain: "Betta Mahachaiensis",
    category: "Wild Betta",
    breeder: "LUBH",
    owner: "Joem Mendoza",
    team: "LUBH",
    region: "Luzon",
    points: 1044,
    previousRank: 6,
    competitions: 10,
    championships: 5,
    winRate: 62,
  },
  {
    id: "BRPH-F-00150",
    name: "Midnight Plakat",
    strain: "Black Orchid Plakat",
    category: "Plakat",
    breeder: "Kasai",
    owner: "Mart Ruzzel Matudio",
    team: "Kasai",
    region: "Mindanao",
    points: 988,
    previousRank: 9,
    competitions: 10,
    championships: 4,
    winRate: 60,
  },
  {
    id: "BRPH-F-00077",
    name: "Solar Flare",
    strain: "Orange Koi HMPK",
    category: "HMPK",
    breeder: "Outlaws",
    owner: "Joseph Ramos",
    team: "Outlaws",
    region: "Luzon",
    points: 940,
    previousRank: 8,
    competitions: 9,
    championships: 4,
    winRate: 58,
  },
  {
    id: "BRPH-F-00099",
    name: "Tidal Giant",
    strain: "Steel Blue Giant",
    category: "Giant",
    breeder: "Krakens PH",
    owner: "Kate Dalaguit",
    team: "Krakens PH",
    region: "Visayas",
    points: 902,
    previousRank: 12,
    competitions: 9,
    championships: 3,
    winRate: 55,
  },
];

/* ------------------------------------------------------------------ */
/*  Player rankings (owners — the featured competitors)                */
/*                                                                     */
/*  To keep judging unbiased, fish carry no name or permanent ID in    */
/*  the rankings. A player is ranked purely on *what they won* — Best  */
/*  of Show, Division Champions, then 1st / 2nd / 3rd placements.      */
/* ------------------------------------------------------------------ */

export interface Player {
  id: string;
  name: string;
  team: string;
  region: Region;
  photo?: string; // player-uploaded portrait (data URL in this mock)
  socials?: Socials;
  previousRank: number;
  points: number; // national season points (the ranking driver)
  bestOfShow: number;
  divisionChampions: number;
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  championships: number; // headline: Best of Show + Division Champs + 1st
  competitions: number;
  winRate: number;
}

/**
 * Real season standings (official FINOY spreadsheet). Each player accumulates
 * points across the season's qualifying legs that sum to a national TOTAL. The
 * national ranking is the order of these totals; the achievement medals shown
 * in the UI are derived from each player's standing (fish stay anonymous).
 */
const PLAYER_SEED: { name: string; total: number }[] = [
  { name: "Martin Ozaeta", total: 1660 },
  { name: "Mart Ruzzel Matudio", total: 1220 },
  { name: "Kate Dalaguit", total: 715 },
  { name: "Joseph Ramos", total: 700 },
  { name: "Casey Alana", total: 610 },
  { name: "Joem Mendoza", total: 510 },
  { name: "Akame", total: 505 },
  { name: "Charles Cruz", total: 420 },
  { name: "Ralph Allen Gonzales", total: 395 },
  { name: "Jay-Ar Quezada", total: 385 },
  { name: "John Reiden Escover", total: 320 },
  { name: "Manuel Manalo Plata", total: 280 },
  { name: "Anthony Topasi", total: 275 },
  { name: "Harold Babanto", total: 275 },
  { name: "Angel Lanz Sison", total: 205 },
  { name: "Jaaron Jeestan Go", total: 205 },
  { name: "Mark Anthony Pahulaya", total: 195 },
  { name: "Rico Mayor", total: 130 },
  { name: "Thome John Estifona", total: 120 },
  { name: "Joshua Ong", total: 120 },
  { name: "Ralf John Cruz", total: 110 },
  { name: "Anton Carlos", total: 105 },
  { name: "Glend Dolosa", total: 100 },
  { name: "Rafael Villahermosa", total: 95 },
  { name: "Marco Paulo Gomez", total: 75 },
  { name: "Carlo Carandang", total: 70 },
  { name: "Erwin Gamao", total: 55 },
  { name: "Ralph Valdevieso", total: 50 },
  { name: "Rj Deciderio", total: 50 },
  { name: "Earle Yuyek", total: 30 },
  { name: "Prince Joereine Caballero", total: 30 },
  { name: "Enrico Divino", total: 25 },
  { name: "Billwilliam", total: 20 },
  { name: "Jerico Vargas Cordova", total: 10 },
  { name: "Andrei Maniquiz", total: 10 },
  { name: "JV Argiedo", total: 5 },
];

// Spread a player's season points into a believable medal breakdown, scaled to
// the leaderboard's top score so the table reads monotonically top-to-bottom.
function playerAchievements(total: number, top: number) {
  const f = top > 0 ? total / top : 0;
  const bestOfShow = Math.round(f * 2);
  const divisionChampions = Math.round(f * 4);
  const firstPlace = Math.round(f * 6);
  const secondPlace = Math.round(f * 5);
  const thirdPlace = Math.round(f * 4);
  return {
    bestOfShow,
    divisionChampions,
    firstPlace,
    secondPlace,
    thirdPlace,
    championships: bestOfShow + divisionChampions + firstPlace,
    competitions: Math.round(4 + f * 14),
    winRate: Math.round(40 + f * 55),
  };
}

export function playerRankings(): Player[] {
  const sorted = [...PLAYER_SEED].sort((a, b) => b.total - a.total);
  const top = sorted[0]?.total ?? 1;
  const n = sorted.length;
  return sorted.map((s, i) => {
    const id = slugify(s.name);
    const team = teamRankings[showHash(id) % teamRankings.length];
    const drift = (showHash(id + "prev") % 5) - 2;
    return {
      id,
      name: s.name,
      team: team.name,
      region: team.region,
      socials: socialsFor("player" + id, s.name),
      previousRank: Math.min(n, Math.max(1, i + 1 + drift)),
      points: s.total,
      ...playerAchievements(s.total, top),
    };
  });
}

export function getPlayer(id: string): Player | undefined {
  return playerRankings().find((p) => p.id === id);
}

/**
 * The signed-in player (mock). Every logged-in player reaches their own profile
 * at the stable route `/players/me`, which resolves to this id. Swap for the
 * real session lookup when auth exists.
 */
export const currentPlayer = {
  id: "martin-ozaeta",
  loggedIn: true,
};

/**
 * The platform Super Admin (mock) — federation-wide control: monitors every
 * account and assigns roles. Swap for the real owner/session record once auth
 * exists.
 */
export const superAdmin = {
  name: "Super Admin",
  email: "mvnpflores.23148@gmail.com",
};

// The award breakdown that explains a player's rank (non-zero only).
export function playerMedals(
  p: Player,
): { icon: string; label: string; short: string; count: number }[] {
  return [
    { icon: "🏆", label: "Best of Show", short: "BoS", count: p.bestOfShow },
    { icon: "🛡️", label: "Division Champion", short: "Div. Champ", count: p.divisionChampions },
    { icon: "🥇", label: "1st Placer", short: "1st", count: p.firstPlace },
    { icon: "🥈", label: "2nd Placer", short: "2nd", count: p.secondPlace },
    { icon: "🥉", label: "3rd Placer", short: "3rd", count: p.thirdPlace },
  ].filter((m) => m.count > 0);
}

// Real breeders (official spreadsheet). Each breeder anchors a team/stable —
// the parenthetical name in the source — and earns the same national points.
const BREEDER_SEED: { name: string; farm: string; total: number }[] = [
  { name: "Magna Carta", farm: "Dauntless", total: 2390 },
  { name: "Daniel Esmalla", farm: "Kasai", total: 2280 },
  { name: "Luis Enrera", farm: "Krakens PH", total: 1570 },
  { name: "Julian Miles Nisay", farm: "Outlaws", total: 560 },
  { name: "Jury's Bakeshop", farm: "TNBH", total: 420 },
  { name: "Nathaniel Mangaoil", farm: "LUBH", total: 420 },
  { name: "Ralph Allen Gonzales", farm: "RATBU", total: 395 },
  { name: "Johhan Alpos", farm: "Betta Heneral", total: 385 },
  { name: "Ivan Ocumen", farm: "Pasiklaban", total: 385 },
  { name: "Acas Betta", farm: "Betta Symphony", total: 320 },
  { name: "Paul Bongalon", farm: "Buenas Sywerte", total: 175 },
  { name: "Arvin Guizano", farm: "El Ganador", total: 130 },
  { name: "Michael Aljon Ellazar", farm: "Bettalion Alliance", total: 100 },
];

export const breederRankings: Breeder[] = (() => {
  const sorted = [...BREEDER_SEED].sort((a, b) => b.total - a.total);
  const top = sorted[0].total;
  const n = sorted.length;
  return sorted.map((s, i) => {
    const id = slugify(s.farm);
    const f = s.total / top;
    const drift = (showHash(id + "prev") % 5) - 2;
    return {
      id,
      name: s.name,
      farm: s.farm,
      region: REGIONS_4[showHash(s.farm) % 4],
      points: s.total,
      previousRank: Math.min(n, Math.max(1, i + 1 + drift)),
      fish: Math.round(12 + f * 60),
      championships: Math.round(f * 24),
      winRate: Math.round(45 + f * 45),
      socials: socialsFor("breeder" + id, s.farm),
    };
  });
})();

// Real teams (official spreadsheet), ranked by accumulated national points.
const TEAM_SEED: { name: string; total: number }[] = [
  { name: "Dauntless", total: 2390 },
  { name: "Kasai", total: 2280 },
  { name: "Krakens PH", total: 1570 },
  { name: "Outlaws", total: 560 },
  { name: "TNBH", total: 420 },
  { name: "LUBH", total: 420 },
  { name: "RATBU", total: 395 },
  { name: "Pasiklaban", total: 385 },
  { name: "Betta Heneral", total: 385 },
  { name: "Betta Symphony", total: 320 },
  { name: "Buenas Sywerte", total: 175 },
  { name: "El Ganador", total: 130 },
  { name: "Bettalion Alliance", total: 100 },
  { name: "Paradigm", total: 30 },
];

export const teamRankings: Team[] = (() => {
  const sorted = [...TEAM_SEED].sort((a, b) => b.total - a.total);
  const top = sorted[0].total;
  const n = sorted.length;
  return sorted.map((s, i) => {
    const id = slugify(s.name);
    const f = s.total / top;
    const drift = (showHash(id + "prev") % 5) - 2;
    return {
      id,
      name: s.name,
      region: REGIONS_4[showHash(s.name) % 4],
      points: s.total,
      previousRank: Math.min(n, Math.max(1, i + 1 + drift)),
      members: Math.round(8 + f * 34),
      championships: Math.round(f * 38),
    };
  });
})();

/* ------------------------------------------------------------------ */
/*  Team profiles (directory + detail + recruitment)                   */
/* ------------------------------------------------------------------ */

export interface TeamMember {
  name: string;
  role: string;
}

export interface TeamProfile extends Team {
  rank: number;
  logo: string; // emoji stand-in for an uploaded logo
  tagline: string;
  about: string;
  captain: string;
  founded: number;
  homeBase: string;
  email: string;
  phone: string;
  recruiting: boolean;
  achievements: string[];
  roster: TeamMember[]; // key roles — shown publicly
  privateMembers: TeamMember[]; // regular members — visible to team members only
  socials?: Socials;
}

// Each team is captained by its breeder (the parenthetical name in the source).
const TEAM_CAPTAINS: Record<string, string> = {
  Dauntless: "Magna Carta",
  Kasai: "Daniel Esmalla",
  "Krakens PH": "Luis Enrera",
  Outlaws: "Julian Miles Nisay",
  TNBH: "Jury's Bakeshop",
  LUBH: "Nathaniel Mangaoil",
  RATBU: "Ralph Allen Gonzales",
  "Betta Heneral": "Johhan Alpos",
  Pasiklaban: "Ivan Ocumen",
  "Betta Symphony": "Acas Betta",
  "Buenas Sywerte": "Paul Bongalon",
  "El Ganador": "Arvin Guizano",
  "Bettalion Alliance": "Michael Aljon Ellazar",
};

const TEAM_LOGOS = ["🛡️", "🔥", "🐙", "🃏", "🌊", "🌙", "🐉", "⚔️", "⚡", "🎼", "🍀", "🏆", "💥", "🌀"];
const TEAM_TAGLINES = [
  "Discipline. Bloodlines. Dominance.",
  "Bred to win.",
  "Form, finnage, fire.",
  "Every bench, every battle.",
  "Lines that last.",
  "Champions by design.",
  "Pure stock, proven results.",
];
const REGION_CITY: Record<Region, string> = {
  Luzon: "Baguio City",
  Visayas: "Cebu City",
  Mindanao: "Davao City",
  NCR: "Quezon City",
};

function teamDetail(t: Team, rank: number): Omit<TeamProfile, keyof Team | "rank"> {
  const captain = TEAM_CAPTAINS[t.name] ?? "To be announced";
  const hasCaptain = captain !== "To be announced";
  const recruiting = showHash(t.id + "rec") % 3 !== 0;
  return {
    logo: TEAM_LOGOS[showHash(t.id) % TEAM_LOGOS.length],
    tagline: TEAM_TAGLINES[showHash(t.id + "tag") % TEAM_TAGLINES.length],
    about: `${t.name} is a ${t.region} betta club, currently ranked #${rank} nationally with ${t.championships} competition championships. ${
      recruiting
        ? "The roster is open to new breeders and handlers this season."
        : "The club competes by invitation only."
    }`,
    captain,
    founded: 2016 + (showHash(t.id + "yr") % 8),
    homeBase: REGION_CITY[t.region],
    email: `team@${t.id}.ph`,
    phone: `+63 917 555 0${String(100 + rank).slice(-3)}`,
    recruiting,
    achievements: [
      `National rank #${rank} — 2026 season`,
      `${t.championships} competition championships`,
      `${t.points.toLocaleString()} national points`,
    ],
    roster: hasCaptain
      ? [
          { name: captain, role: "Captain · Head Breeder" },
          { name: "Open slots", role: recruiting ? "Now recruiting" : "Roster full" },
        ]
      : [{ name: "Open slots", role: "Now recruiting" }],
    privateMembers: [{ name: "Members list", role: "Visible to team members" }],
    socials: socialsFor("team" + t.id, t.name),
  };
}

export function teamProfiles(): TeamProfile[] {
  return teamRankings.map((t, i) => ({
    ...t,
    rank: i + 1,
    ...teamDetail(t, i + 1),
  }));
}

export function getTeam(id: string): TeamProfile | undefined {
  const idx = teamRankings.findIndex((t) => t.id === id);
  if (idx < 0) return undefined;
  const base = teamRankings[idx];
  return { ...base, rank: idx + 1, ...teamDetail(base, idx + 1) };
}

const HANDLER_BASE: Omit<Handler, "socials">[] = [
  {
    id: "joki-king-arnel",
    name: "Arnel Pascual",
    alias: "King Arnel",
    region: "Luzon",
    points: 3210,
    previousRank: 1,
    fishHandled: 312,
    benchAccuracy: 99,
  },
  {
    id: "joki-vince",
    name: "Vince Lim",
    alias: "Steady Vince",
    region: "Visayas",
    points: 2870,
    previousRank: 3,
    fishHandled: 281,
    benchAccuracy: 98,
  },
  {
    id: "joki-datu",
    name: "Datu Salonga",
    alias: "Datu",
    region: "Mindanao",
    points: 2640,
    previousRank: 2,
    fishHandled: 254,
    benchAccuracy: 97,
  },
  {
    id: "joki-rico",
    name: "Rico Mendoza",
    alias: "Quickhand Rico",
    region: "NCR",
    points: 2180,
    previousRank: 4,
    fishHandled: 198,
    benchAccuracy: 96,
  },
];

export const handlerRankings: Handler[] = HANDLER_BASE.map((h) => ({
  ...h,
  socials: socialsFor("handler" + h.id, h.alias),
}));

/* ------------------------------------------------------------------ */
/*  Registered handlers (self-registration + official assignment)      */
/* ------------------------------------------------------------------ */

export interface RegisteredHandler {
  id: string;
  name: string;
  alias: string;
  region: Region;
  experience: number; // years
  specialty: string;
  status: "verified" | "applicant";
}

/**
 * The federation-wide pool of handlers who have registered themselves.
 * Organizers pick from this list to designate official handlers for a show.
 * "verified" handlers already hold a national ranking; "applicant" handlers
 * have registered but are awaiting their first official assignment.
 */
export const registeredHandlers: RegisteredHandler[] = [
  { id: "joki-king-arnel", name: "Arnel Pascual", alias: "King Arnel", region: "Luzon", experience: 9, specialty: "HMPK & Halfmoon", status: "verified" },
  { id: "joki-vince", name: "Vince Lim", alias: "Steady Vince", region: "Visayas", experience: 7, specialty: "Plakat", status: "verified" },
  { id: "joki-datu", name: "Datu Salonga", alias: "Datu", region: "Mindanao", experience: 8, specialty: "Giant", status: "verified" },
  { id: "joki-rico", name: "Rico Mendoza", alias: "Quickhand Rico", region: "NCR", experience: 5, specialty: "Local league", status: "verified" },
  { id: "joki-bea", name: "Bea Hernandez", alias: "Steady Bea", region: "Luzon", experience: 3, specialty: "Female & Crowntail", status: "applicant" },
  { id: "joki-marlon", name: "Marlon Cruz", alias: "Iron Hands", region: "Visayas", experience: 2, specialty: "Giant", status: "applicant" },
  { id: "joki-tope", name: "Christopher Uy", alias: "Tope", region: "Mindanao", experience: 4, specialty: "Wild Betta", status: "applicant" },
  { id: "joki-jm", name: "JM Bacani", alias: "JM", region: "NCR", experience: 1, specialty: "HMPK", status: "applicant" },
];

/* ------------------------------------------------------------------ */
/*  Handler dashboard — fish a verified handler is benching            */
/* ------------------------------------------------------------------ */

// The signed-in handler (mock). Verified handlers get the tracking page.
export const currentHandler = {
  id: "joki-king-arnel",
  name: "Arnel Pascual",
  alias: "King Arnel",
  region: "Luzon" as Region,
  verified: true,
};

export type HandledStatus =
  | "Champion"
  | "1st"
  | "Prince"
  | "2nd"
  | "3rd"
  | "Candidate"
  | "Reclassed"
  | "OUT"
  | "Judging"
  | "Benched";

export interface HandledFish {
  code: string;
  className: string;
  division: string;
  divisionAbbr: string;
  owner: string;
  ownerId: string;
  show: string;
  status: HandledStatus;
  note?: string; // organizer's fault / remark
}

const SHOW_CEBU = "Cebu City Betta Showdown";

// Every fish the signed-in handler is benching, with its owner (two-way view).
export const handlerEntries: HandledFish[] = [
  { code: "C3-014", className: "Solid — Male", division: "Crowntail Division", divisionAbbr: "CT", owner: "Kate Dalaguit", ownerId: "kate-dalaguit", show: SHOW_CEBU, status: "Champion" },
  { code: "A1-007", className: "Solid Red — Male", division: "Halfmoon Division", divisionAbbr: "HM", owner: "Joseph Ramos", ownerId: "joseph-ramos", show: SHOW_CEBU, status: "1st" },
  { code: "OCV1-031", className: "Light Bicolor", division: "OCV HMPK Division", divisionAbbr: "OCV", owner: "Mart Ruzzel Matudio", ownerId: "mart-ruzzel-matudio", show: SHOW_CEBU, status: "Prince" },
  { code: "B2-009", className: "Fancy — Male", division: "Halfmoon Plakat Division", divisionAbbr: "HMPK", owner: "Casey Alana", ownerId: "casey-alana", show: SHOW_CEBU, status: "2nd" },
  { code: "A4-021", className: "Butterfly — Male", division: "Halfmoon Division", divisionAbbr: "HM", owner: "Joem Mendoza", ownerId: "joem-mendoza", show: SHOW_CEBU, status: "3rd" },
  { code: "A1-003", className: "Solid Red — Male", division: "Halfmoon Division", divisionAbbr: "HM", owner: "Martin Ozaeta", ownerId: "martin-ozaeta", show: SHOW_CEBU, status: "Candidate" },
  { code: "A3-008", className: "Multicolor — Male", division: "Halfmoon Division", divisionAbbr: "HM", owner: "Martin Ozaeta", ownerId: "martin-ozaeta", show: SHOW_CEBU, status: "Reclassed", note: "Better fit in Multicolor class" },
  { code: "B1-016", className: "Solid — Male", division: "Halfmoon Plakat Division", divisionAbbr: "HMPK", owner: "Kate Dalaguit", ownerId: "kate-dalaguit", show: SHOW_CEBU, status: "Judging" },
  { code: "C1-019", className: "Solid — Male", division: "Crowntail Division", divisionAbbr: "CT", owner: "Casey Alana", ownerId: "casey-alana", show: SHOW_CEBU, status: "Benched" },
  { code: "A1-002", className: "Solid Red — Male", division: "Halfmoon Division", divisionAbbr: "HM", owner: "Joseph Ramos", ownerId: "joseph-ramos", show: SHOW_CEBU, status: "OUT", note: "Oversized, anal fin fault" },
];

/* ------------------------------------------------------------------ */
/*  Accounts & roles (Super Admin)                                     */
/* ------------------------------------------------------------------ */

// Every account is a Player by default; the Super Admin grants extra roles.
export type AccountRole =
  | "Handler"
  | "Organizer"
  | "Team Leader"
  | "Breeder"
  | "Judge";
export const ACCOUNT_ROLES: AccountRole[] = [
  "Handler",
  "Organizer",
  "Team Leader",
  "Breeder",
  "Judge",
];
// Top roles a Team Leader can assign within their team.
export const TEAM_ROLES = ["Captain", "Breeder Lead", "Head Handler", "Member"];

export interface Account {
  id: string;
  name: string;
  email: string;
  region: Region;
  // initial roles + led team (the Super Admin can change these)
  roles?: AccountRole[];
  ledTeam?: string;
}

export const accounts: Account[] = [
  { id: "magna-carta", name: "Magna Carta", email: "magna@dauntless.ph", region: "Luzon", roles: ["Team Leader", "Breeder"], ledTeam: "Dauntless" },
  { id: "daniel-esmalla", name: "Daniel Esmalla", email: "daniel@kasai.ph", region: "Visayas", roles: ["Team Leader", "Breeder"], ledTeam: "Kasai" },
  { id: "luis-enrera", name: "Luis Enrera", email: "luis@krakensph.ph", region: "NCR", roles: ["Breeder", "Judge"] },
  { id: "ivan-ocumen", name: "Ivan Ocumen", email: "ivan@pasiklaban.ph", region: "Visayas", roles: ["Team Leader", "Breeder"], ledTeam: "Pasiklaban" },
  { id: "ralph-allen-gonzales", name: "Ralph Allen Gonzales", email: "ralph@ratbu.ph", region: "Luzon", roles: ["Breeder"] },
  { id: "martin-ozaeta", name: "Martin Ozaeta", email: "martin@finoy.pet", region: "Luzon" },
  { id: "mart-ruzzel-matudio", name: "Mart Ruzzel Matudio", email: "mart@finoy.pet", region: "Visayas" },
  { id: "kate-dalaguit", name: "Kate Dalaguit", email: "kate@finoy.pet", region: "Mindanao" },
  { id: "joshua-ong", name: "Joshua Ong", email: "joshua@finoy.pet", region: "NCR", roles: ["Judge"] },
  { id: "arnel-pascual", name: "Arnel Pascual", email: "arnel@kingarnel.ph", region: "Luzon", roles: ["Handler"] },
  { id: "vince-lim", name: "Vince Lim", email: "vince@steadyvince.ph", region: "Visayas", roles: ["Handler"] },
  { id: "rico-mendoza", name: "Rico Mendoza", email: "rico@metrokings.ph", region: "NCR", roles: ["Organizer"] },
];

// People the Super Admin has labelled as Judges — the official judge pool that
// organizers draw from. A judge may NOT register a fish (to keep judging fair).
export function officialJudges(): Account[] {
  return accounts.filter((a) => (a.roles ?? []).includes("Judge"));
}
export function isOfficialJudge(name: string): boolean {
  return accounts.some(
    (a) => a.name === name && (a.roles ?? []).includes("Judge"),
  );
}

/* ------------------------------------------------------------------ */
/*  Team registrations awaiting Super Admin approval                   */
/* ------------------------------------------------------------------ */

// A club that submitted "Register a Team" and is awaiting federation review.
// Once approved it joins the national directory and can earn championships.
export interface PendingTeam {
  id: string;
  name: string;
  region: Region;
  captain: string;
  homeBase: string;
  email: string;
  about: string;
  recruiting: boolean;
  submitted: string; // relative label (mock)
}

export const pendingTeams: PendingTeam[] = [
  {
    id: "pt-bicol-surge",
    name: "Bicol Surge",
    region: "Luzon",
    captain: "Noli Rosales",
    homeBase: "Legazpi City",
    email: "captain@bicolsurge.ph",
    about:
      "A growing Bicol club focused on HMPK and Plakat lines, building the next wave of southern Luzon competitors.",
    recruiting: true,
    submitted: "2 days ago",
  },
  {
    id: "pt-iloilo-reef-kings",
    name: "Iloilo Reef Kings",
    region: "Visayas",
    captain: "Dindo Salcedo",
    homeBase: "Iloilo City",
    email: "kings@iloiloreef.ph",
    about:
      "Western Visayas hobbyists specializing in Giant and Crowntail forms, with a strong mentorship program.",
    recruiting: true,
    submitted: "5 days ago",
  },
  {
    id: "pt-davao-apex",
    name: "Davao Apex Bettas",
    region: "Mindanao",
    captain: "Rey Maglasang",
    homeBase: "Davao City",
    email: "apex@davaobettas.ph",
    about:
      "A results-first Davao team chasing Giant national titles and a top-10 finish in its debut season.",
    recruiting: false,
    submitted: "1 week ago",
  },
];

/* ------------------------------------------------------------------ */
/*  Per-show standings (deterministic, derived from national pools)    */
/*                                                                     */
/*  Until past results are fully encoded, each show derives its own    */
/*  Top players / teams / handlers / breeders and its major-award fish */
/*  deterministically from the national pools, seeded by the slug.     */
/* ------------------------------------------------------------------ */

export interface ShowRankRow {
  name: string;
  sub: string;
  value: number;
}
export interface ShowMajorAward {
  award: string;
  code: string;
  fish: string;
  owner: string;
}
export interface ShowStandings {
  players: ShowRankRow[];
  teams: ShowRankRow[];
  handlers: ShowRankRow[];
  breeders: ShowRankRow[];
  placers: ShowMajorAward[];
  divisionChampions: ShowMajorAward[];
  majorAwards: ShowMajorAward[];
}

const PLACER_DEFS = [
  { cls: "A1", place: "Champion" },
  { cls: "A1", place: "1st Runner-up" },
  { cls: "A2", place: "Champion" },
  { cls: "B1", place: "Champion" },
  { cls: "B1", place: "2nd Runner-up" },
  { cls: "C1", place: "Champion" },
];

function showHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function showBenchCode(seed: string): string {
  const h = showHash(seed);
  const letter = "ABCD"[h % 4];
  const num = ((h >> 3) % 4) + 1;
  const seq = String(((h >> 6) % 60) + 1).padStart(4, "0");
  return `${letter}${num}-${seq}`;
}

// Fish-based major awards (Best Team / Best Handler are not fish, so excluded).
const FISH_MAJOR_AWARDS = [
  "Best of Show",
  "Best in Giants",
  "King OCV Regular",
  "King OCV Junior",
  "Best in Optional",
  "Best in Female",
  "Best in Form & Finnage",
];

export function showStandings(slug: string): ShowStandings {
  const rank = <T extends { id: string }>(
    pool: T[],
    take: number,
    row: (t: T) => ShowRankRow,
  ): ShowRankRow[] =>
    pool
      .map(row)
      .sort((a, b) => b.value - a.value)
      .slice(0, take);

  const players = rank(playerRankings(), 5, (p) => ({
    name: p.name,
    sub: `${p.team} · ${p.region}`,
    value: (showHash(slug + p.id) % 6) + 2,
  }));

  const teams = rank(teamRankings, 5, (t) => ({
    name: t.name,
    sub: t.region,
    value: (showHash(slug + t.id) % 9) + 3,
  }));

  const handlers = rank(handlerRankings, 3, (h) => ({
    name: `“${h.alias}”`,
    sub: `${h.name} · ${h.region}`,
    value: (showHash(slug + h.id) % 14) + 6,
  }));

  const breeders = rank(breederRankings, 3, (b) => ({
    name: b.farm,
    sub: `${b.name} · ${b.region}`,
    value: (showHash(slug + b.id) % 5) + 2,
  }));

  // Tier 1 — placer awards (per-class 1st / runners-up).
  const placers: ShowMajorAward[] = PLACER_DEFS.map((d) => {
    const fish =
      fishRankings[showHash(slug + d.cls + d.place) % fishRankings.length];
    const seq = String((showHash(slug + d.cls + d.place) % 60) + 1).padStart(
      4,
      "0",
    );
    return {
      award: `Class ${d.cls} · ${d.place}`,
      code: `${d.cls}-${seq}`,
      fish: fish.name,
      owner: fish.owner,
    };
  });

  // Tier 2 — division champions.
  const divisionChampions: ShowMajorAward[] = OFFICIAL_DIVISIONS.filter(
    (d) => d.group === "Regular",
  )
    .slice(0, 5)
    .map((d) => {
      const fish =
        fishRankings[showHash(slug + "dc" + d.name) % fishRankings.length];
      return {
        award: `${d.abbr || d.name} · Division Champion`,
        code: showBenchCode(slug + "dc" + d.name),
        fish: fish.name,
        owner: fish.owner,
      };
    });

  // Tier 3 — major awards.
  const majorAwards: ShowMajorAward[] = FISH_MAJOR_AWARDS.map((award) => {
    const fish = fishRankings[showHash(slug + award) % fishRankings.length];
    return {
      award,
      code: showBenchCode(slug + award),
      fish: fish.name,
      owner: fish.owner,
    };
  });

  return {
    players,
    teams,
    handlers,
    breeders,
    placers,
    divisionChampions,
    majorAwards,
  };
}

/* ------------------------------------------------------------------ */
/*  Player-friendly entry status (search by QR / code)                 */
/* ------------------------------------------------------------------ */

export type EntryStage =
  | "Registered"
  | "Payment confirmed"
  | "Benched in"
  | "Under judging"
  | "Completed";

export const ENTRY_STAGES: EntryStage[] = [
  "Registered",
  "Payment confirmed",
  "Benched in",
  "Under judging",
  "Completed",
];

export interface FishStatus {
  code: string;
  fish?: string;
  owner?: string;
  handler?: string;
  category?: string;
  stageIndex: number; // 0..4
  completed: boolean;
  won: boolean;
  placement: string;
  awards: string[];
  note?: string; // organizer's fault / remark
}

// Common judging faults organizers can note on an entry (esp. for OUT fish).
export const FAULT_NOTES = [
  "Oversized",
  "Anal fin fault",
  "Deportment issues",
  "Topline fault",
  "Body curvature",
  "Color bleeding",
  "Dorsal ray fault",
  "Ventral too long",
  "Caudal pinching",
  "Mouth/jaw fault",
];

function faultFor(seed: string): string {
  const h = showHash(seed);
  const a = FAULT_NOTES[h % FAULT_NOTES.length];
  const b = FAULT_NOTES[(h >> 8) % FAULT_NOTES.length];
  return a === b ? a : `${a}, ${b}`;
}

/**
 * Look up an entry's live status by its bench code (e.g. "A1-0005") or entry
 * id. Deterministic, so a given code always returns the same status until the
 * backend supplies real results.
 */
export function lookupFishStatus(query: string): FishStatus | null {
  const raw = query.trim();
  if (raw.length < 2) return null;
  // Entries are anonymous — looked up by bench code only, never a name or ID.
  const norm = raw.toUpperCase().replace(/\s+/g, "");
  const h = showHash(norm);

  // Stage — biased toward Completed so players usually see a result.
  const stageRoll = h % 10;
  const stageIndex =
    stageRoll < 2 ? 0 : stageRoll < 3 ? 1 : stageRoll < 4 ? 2 : stageRoll < 5 ? 3 : 4;
  const completed = stageIndex === 4;

  let placement = "Awaiting result";
  let won = false;
  const awards: string[] = [];

  if (completed) {
    const placeRoll = (h >> 4) % 10;
    if (placeRoll === 0) {
      placement = "Champion (1st)";
      won = true;
    } else if (placeRoll === 1) {
      placement = "1st Runner-up (2nd)";
      won = true;
    } else if (placeRoll === 2) {
      placement = "2nd Runner-up (3rd)";
      won = true;
    } else if (placeRoll <= 4) {
      placement = "Top placement";
      won = true;
    } else {
      placement = "Did not place (OUT)";
      won = false;
    }
    if (placeRoll === 0 && (h >> 8) % 3 === 0) {
      awards.push(FISH_MAJOR_AWARDS[(h >> 10) % FISH_MAJOR_AWARDS.length]);
    }
  }

  return {
    code: norm,
    handler: registeredHandlers[(h >> 12) % registeredHandlers.length].alias,
    stageIndex,
    completed,
    won,
    placement,
    awards,
    // Organizer's fault note when the fish is OUT.
    note: completed && !won ? faultFor(norm) : undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Player / handler notifications (live updates on their entries)     */
/* ------------------------------------------------------------------ */

export interface PlayerNotification {
  id: string;
  code: string;
  type: "1st" | "2nd" | "3rd" | "out" | "reclass" | "candidate";
  icon: string;
  title: string;
  message: string;
  tone: "win" | "lose" | "info";
  time: string;
}

// Playful, Taglish updates so players stay hyped — win or lose.
export const playerNotifications: PlayerNotification[] = [
  {
    id: "n1",
    code: "C3-014",
    type: "candidate",
    icon: "👑",
    tone: "win",
    title: "Candidate for Division Champion!",
    message:
      "Grabe! Your fish C3-014 is moving up to Division Champion judging. Laban lang, kapamilya! 🔥",
    time: "just now",
  },
  {
    id: "n2",
    code: "C3-014",
    type: "1st",
    icon: "🏆",
    tone: "win",
    title: "1st Place — Class Champion!",
    message: "Astig! C3-014 topped its class. Solid talaga ang alaga mo! 🎉",
    time: "3m ago",
  },
  {
    id: "n3",
    code: "B2-009",
    type: "2nd",
    icon: "🥈",
    tone: "win",
    title: "2nd Place!",
    message: "Ang lapit! B2-009 grabbed 2nd. Next show, sa tuktok na 'yan!",
    time: "9m ago",
  },
  {
    id: "n4",
    code: "A4-021",
    type: "3rd",
    icon: "🥉",
    tone: "win",
    title: "3rd Place — On the podium!",
    message: "Nasa podium tayo! A4-021 took 3rd. Proud na proud kami! 🙌",
    time: "16m ago",
  },
  {
    id: "n5",
    code: "A3-008",
    type: "reclass",
    icon: "🔄",
    tone: "info",
    title: "Reclassed to a better fit",
    message:
      "Heads up! A3-008 was reclassed to B1 — bagong class, panibagong pag-asa! 💫",
    time: "22m ago",
  },
  {
    id: "n6",
    code: "A1-002",
    type: "out",
    icon: "😅",
    tone: "lose",
    title: "Tulak muna this round!",
    message:
      "Tulak entry mo with the code A1-002 — di natuloy ngayon. Wag mag-alala, balik tayo sa susunod! 💪",
    time: "28m ago",
  },
];

/* ------------------------------------------------------------------ */
/*  Results by Division → Class (codes only, global tank numbers)      */
/* ------------------------------------------------------------------ */

export type EntryStatus =
  | "1st"
  | "2nd"
  | "3rd"
  | "Prince"
  | "OUT"
  | "Reclassed"
  | "In class";

export interface ClassEntryResult {
  code: string;
  status: EntryStatus;
  reclassedTo?: string;
  note?: string; // organizer's fault / remark
}
export interface ClassResult {
  classCode: string;
  className: string;
  entryCount: number;
  entries: ClassEntryResult[];
  winners: { place: string; code: string }[];
}
export interface DivisionResult {
  name: string;
  abbr: string;
  isOCV: boolean;
  classes: ClassResult[];
}

// Each show division has a descriptive name + abbreviation, and every class a
// descriptive name (the class code's prefix + index forms the bench code).
const SHOW_DIVISIONS: {
  name: string;
  abbr: string;
  prefix: string;
  classNames: string[];
}[] = [
  {
    name: "Halfmoon Division",
    abbr: "HM",
    prefix: "A",
    classNames: [
      "Solid Red — Male",
      "Solid Blue — Male",
      "Multicolor — Male",
      "Butterfly — Male",
      "Marble — Male",
      "Female",
    ],
  },
  {
    name: "Halfmoon Plakat Division",
    abbr: "HMPK",
    prefix: "B",
    classNames: [
      "Solid — Male",
      "Fancy — Male",
      "Koi & Galaxy — Male",
      "Nemo — Male",
      "Black & Copper — Male",
      "Female",
    ],
  },
  {
    name: "Crowntail Division",
    abbr: "CT",
    prefix: "C",
    classNames: [
      "Solid — Male",
      "Bicolor — Male",
      "Multicolor — Male",
      "Marble — Male",
      "Fancy — Male",
      "Female",
    ],
  },
  {
    name: "OCV HMPK Division",
    abbr: "OCV",
    prefix: "OCV",
    classNames: ["Light Bicolor", "Dark Bicolor", "Multicolor"],
  },
];

// Pad a tank number to the digit-count of the show's total entries (min 3).
// e.g. 760 entries → "003", "012"; 1,000+ entries → "0001", "0012".
export function tankPad(total: number): number {
  return Math.max(3, String(Math.max(0, total)).length);
}

// Raw entry codes per division → class, with a single global tank counter so
// no two entries ever share a tank number.
function genShowEntries(slug: string) {
  const base = showHash(slug + "tankbase") % 4;
  // First pass — entry counts per class, to learn the show's total.
  const divs = SHOW_DIVISIONS.map((d) => ({
    name: d.name,
    abbr: d.abbr,
    prefix: d.prefix,
    count: d.classNames.length,
    isOCV: isOCV(d.prefix),
    classes: d.classNames.map((className, idx) => {
      const ci = idx + 1;
      const classCode = `${d.prefix}${ci}`;
      return {
        classCode,
        className,
        ci,
        entryCount: (showHash(slug + classCode) % 6) + 4, // 4–9
      };
    }),
  }));
  const total = divs.reduce(
    (s, d) => s + d.classes.reduce((t, c) => t + c.entryCount, 0),
    0,
  );
  const width = tankPad(base + total);

  let tank = base;
  return divs.map((d) => ({
    name: d.name,
    abbr: d.abbr,
    prefix: d.prefix,
    count: d.count,
    isOCV: d.isOCV,
    classes: d.classes.map((c) => {
      const codes: string[] = [];
      for (let e = 0; e < c.entryCount; e++) {
        tank += 1;
        codes.push(`${c.classCode}-${String(tank).padStart(width, "0")}`);
      }
      return { classCode: c.classCode, className: c.className, ci: c.ci, codes };
    }),
  }));
}

/**
 * Per-show public results grouped by division → class. Each entry carries a
 * status remark — placement (Prince/1st/2nd/3rd), OUT, Reclassed → another
 * class, or still In class.
 */
export function showDivisionResults(slug: string): DivisionResult[] {
  return genShowEntries(slug).map((d) => ({
    name: d.name,
    abbr: d.abbr,
    isOCV: d.isOCV,
    classes: d.classes.map((c) => {
      const order = c.codes
        .map((code, i) => ({ code, r: showHash(slug + c.classCode + i) }))
        .sort((a, b) => a.r - b.r)
        .map((x) => x.code);
      const places = placementsFor(c.classCode); // [1st|Prince, 2nd, 3rd, OUT]
      const sibling = `${d.prefix}${c.ci === d.count ? 1 : c.ci + 1}`;
      const status: Record<string, ClassEntryResult> = {};
      order.forEach((code, idx) => {
        if (idx === 0) status[code] = { code, status: places[0] as EntryStatus };
        else if (idx === 1) status[code] = { code, status: places[1] as EntryStatus };
        else if (idx === 2) status[code] = { code, status: places[2] as EntryStatus };
        else if (idx === 3)
          status[code] = { code, status: "OUT", note: faultFor(code) };
        else if (idx === 4)
          status[code] = { code, status: "Reclassed", reclassedTo: sibling };
        else status[code] = { code, status: "In class" };
      });
      const entries = c.codes.map((code) => status[code]);
      const winners = order
        .slice(0, 3)
        .map((code, k) => ({ place: places[k], code }))
        .filter((w) => w.code);
      return {
        classCode: c.classCode,
        className: c.className,
        entryCount: c.codes.length,
        entries,
        winners,
      };
    }),
  }));
}

// Flat entry list for the organizer's live scoring (no placement yet).
export interface JudgingEntry {
  id: string;
  code: string;
  division: string;
  divisionAbbr: string;
  classCode: string;
  className: string;
}
export function judgingSeed(slug: string): JudgingEntry[] {
  const out: JudgingEntry[] = [];
  for (const d of genShowEntries(slug))
    for (const c of d.classes)
      for (const code of c.codes)
        out.push({
          id: code,
          code,
          division: d.name,
          divisionAbbr: d.abbr,
          classCode: c.classCode,
          className: c.className,
        });
  return out;
}

// Only one thing is judged at a time — this points at it.
export interface JudgingNow {
  phase: "division" | "major" | "done";
  divisionName?: string;
  classCode?: string;
  label: string;
}

export function showJudging(slug: string, status: string): JudgingNow {
  if (status !== "live") {
    return { phase: "done", label: "Judging complete — final results" };
  }
  const h = showHash(slug + "judging");
  if (h % 6 === 0) {
    return { phase: "major", label: "Major Awards" };
  }
  const divs = showDivisionResults(slug);
  const d = divs[h % divs.length];
  const c = d.classes[(h >> 4) % d.classes.length];
  return {
    phase: "division",
    divisionName: d.name,
    classCode: c.classCode,
    label: `${d.name} (${d.abbr}) — ${c.classCode} ${c.className}`,
  };
}

/* ------------------------------------------------------------------ */
/*  Hall of Fame                                                       */
/* ------------------------------------------------------------------ */

export interface HofEntry {
  title: string;
  winner: string;
  detail: string;
  icon: string;
}

// Player of the Year = the #1 ranked player. Lone Shark = the standout competing
// solo, without a team. Both derived live so the Hall of Fame tracks standings.
const _poty = playerRankings()[0];
const _loneShark =
  playerRankings().find((p) => !p.name.includes(" ")) ?? playerRankings()[1];

export const hallOfFame2026: HofEntry[] = [
  {
    title: "Player of the Year",
    winner: _poty.name,
    detail: `${_poty.team} · ${_poty.region}`,
    icon: "🏅",
  },
  {
    title: "Breeder of the Year",
    winner: "Magna Carta",
    detail: "Dauntless • 2,390 national points",
    icon: "🏆",
  },
  {
    title: "Team of the Year",
    winner: "Dauntless",
    detail: "Champion club • 2,390 national points",
    icon: "🛡️",
  },
  {
    title: "Handler of the Year",
    winner: "Arnel Pascual",
    detail: "“King Arnel” • 99% bench accuracy",
    icon: "✋",
  },
  {
    // The "Lone Shark" — best player flying solo, no team behind them.
    title: "Lone Shark",
    winner: _loneShark.name,
    detail: `Best player with no team — solo all the way · ${_loneShark.region}`,
    icon: "🦈",
  },
];

/* ------------------------------------------------------------------ */
/*  Platform statistics                                                */
/* ------------------------------------------------------------------ */

export const platformStats = {
  competitions: 184,
  fishRegistered: 28640,
  breeders: 3120,
  teams: 96,
  titlesAwarded: 9420,
};

export const sponsors = [
  "AquaPro PH",
  "BettaGuard",
  "Tropica Feeds",
  "BlueLagoon Tanks",
  "FinTech Aquatics",
  "Pinoy Pet Supply",
];

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

export function peso(n: number): string {
  return "₱" + n.toLocaleString("en-PH");
}

/* ------------------------------------------------------------------ */
/*  Platform (SaaS) fee — FINOY's share of each show's revenue         */
/* ------------------------------------------------------------------ */

// FINOY charges organizers a flat percentage of each show's entry-fee revenue.
// e.g. ₱200 entry × 500 entries = ₱100,000 revenue → ₱5,000 platform fee.
export const PLATFORM_FEE_RATE = 0.05; // 5%
export const PLATFORM_FEE_LABEL = "5%";

export function platformFee(revenue: number): number {
  return Math.round(revenue * PLATFORM_FEE_RATE);
}

export function compactNumber(n: number): string {
  return n.toLocaleString("en-PH");
}

export function formatDate(iso: string): string {
  // Deterministic, locale-fixed formatting (UTC) to avoid hydration drift.
  const d = new Date(iso + "T00:00:00Z");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function rankDelta(current: number, previous: number): {
  dir: "up" | "down" | "same";
  value: number;
} {
  if (previous === current) return { dir: "same", value: 0 };
  if (previous > current) return { dir: "up", value: previous - current };
  return { dir: "down", value: current - previous };
}
