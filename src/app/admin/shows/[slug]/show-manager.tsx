"use client";

import { useMemo, useRef, useState } from "react";
import type {
  Category,
  RegisteredHandler,
  DivisionGroup,
  Account,
  ShowSponsor,
} from "@/lib/data";
import { OFFICIAL_DIVISIONS, peso, officialJudges } from "@/lib/data";
import { QrCode } from "@/components/qr-code";
import {
  printStickers,
  downloadStickerBatch,
  type LabelFormat,
  type StickerData,
  type StickerHeader,
} from "@/lib/print-sticker";
import { RankingEditor } from "./ranking-editor";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://finoy.pet";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ClassItem {
  id: string;
  code: string; // e.g. "A1"
  name: string; // e.g. "HMPK Solid Red - Male"
}
interface Division {
  id: string;
  name: string;
  abbr?: string; // e.g. "HM"
  group: DivisionGroup;
  classes: ClassItem[];
}

// Per-division champion round: each class's winning code advances; one DC.
interface ChampionRound {
  winners: Record<string, string>; // classId -> winning entry code
  dc?: string; // classId whose winner is the Division Champion
}

// Higher / major awards that Division Champions advance to.
type AwardSource = "dc" | "team" | "handler" | "special";
interface MajorAward {
  id: string;
  title: string;
  source: AwardSource;
  divisions?: string[]; // included division ids (empty/undefined = all)
  winner?: string; // divisionId (for "dc") or free text (others)
}

// Default division inclusions reference the deterministic seed ids
// (div-seed-<index> follows OFFICIAL_DIVISIONS order). Empty = all divisions.
const DEFAULT_MAJOR_AWARDS: MajorAward[] = [
  { id: "ma-bos", title: "Best of Show", source: "dc", divisions: [] },
  {
    id: "ma-optional",
    title: "Best in Optional",
    source: "dc",
    // Open group: Female, Other Form Variation, Form & Finnage, Wild Betta, Anak Size
    divisions: ["div-seed-10", "div-seed-11", "div-seed-12", "div-seed-13", "div-seed-14"],
  },
  {
    id: "ma-giants",
    title: "Best in Giants",
    source: "dc",
    divisions: ["div-seed-6", "div-seed-8"], // Giant HMPK, Junior Giant
  },
  {
    id: "ma-ocv-reg",
    title: "King OCV Regular",
    source: "dc",
    divisions: ["div-seed-4"], // OCV HMPK
  },
  {
    id: "ma-ocv-jr",
    title: "King OCV Junior",
    source: "dc",
    divisions: ["div-seed-9"], // Junior OCV HMPK
  },
  { id: "ma-team", title: "Best Team", source: "team" },
  { id: "ma-handler", title: "Best Handler", source: "handler" },
];

// Organizer payment channels + proof-of-payment confirmation.
interface PaymentConfig {
  gcashName: string;
  gcashNumber: string;
  mayaName: string;
  mayaNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  facebook: string;
  qrImage?: string; // uploaded scan-to-pay QR (data URL)
}
const DEFAULT_PAYMENT: PaymentConfig = {
  gcashName: "",
  gcashNumber: "",
  mayaName: "",
  mayaNumber: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  facebook: "",
};

interface PaymentProof {
  id: string;
  entryCode: string;
  player: string;
  amount: number;
  method: string;
  screenshot?: string;
  status: "pending" | "confirmed" | "rejected";
  entries?: number; // # of entries covered (for one-time cash codes)
}
const DEMO_PROOFS: PaymentProof[] = [
  {
    id: "pp-1",
    entryCode: "A1-0001, A3-0004",
    player: "Martin Ozaeta",
    amount: 360,
    method: "GCash",
    status: "pending",
  },
  {
    id: "pp-2",
    entryCode: "B2-0012",
    player: "Kate Dalaguit",
    amount: 180,
    method: "PayMaya",
    status: "pending",
  },
];

interface Assignment {
  divisionId?: string;
  classId?: string;
  tank?: string; // tank number, e.g. "001"
  name?: string; // edited fish name
  owner?: string; // edited owner
  placement: string;
  photo?: string;
}

export interface RosterFish {
  id: string;
  name: string;
  owner: string;
  category: Category;
}

/* Resolve the class code (e.g. "A1") an assignment points to. */
function classCodeFor(
  a: Assignment | undefined,
  divisions: Division[],
): string | undefined {
  if (!a?.classId) return undefined;
  for (const d of divisions) {
    const c = d.classes.find((x) => x.id === a.classId);
    if (c) return c.code;
  }
  return undefined;
}

/* Build the bench fish code: "Class + Tank No.", e.g. "A1 - 001". */
function fishCodeFor(
  a: Assignment | undefined,
  divisions: Division[],
): string {
  const code = classCodeFor(a, divisions);
  const tank = a?.tank?.trim();
  if (code && tank) return `${code} - ${tank}`;
  if (code) return code;
  if (tank) return `TANK - ${tank}`;
  return "UNASSIGNED";
}

function normalizeCode(s: string): string {
  return s.toLowerCase().replace(/\s|-/g, "");
}

const PLACEMENTS = [
  "Champion",
  "Reserve Champion",
  "3rd Place",
  "Top 10",
  "Unranked",
];
const PODIUM = new Set(["Champion", "Reserve Champion", "3rd Place"]);

const TABS = [
  { key: "scoring", label: "Live Scoring" },
  { key: "divisions", label: "Divisions & Classes" },
  { key: "champions", label: "Division Champions" },
  { key: "majorawards", label: "Major Awards" },
  { key: "handlers", label: "Official Handlers" },
  { key: "judges", label: "Official Judges" },
  { key: "sponsors", label: "Sponsors" },
  { key: "qr", label: "QR Scan & Edit" },
  { key: "labels", label: "Labels & Stickers" },
  { key: "payment", label: "Mode of Payment" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

/* ------------------------------------------------------------------ */
/*  Parent — holds shared state                                        */
/* ------------------------------------------------------------------ */

export function ShowManager({
  slug,
  showName,
  showDate,
  status,
  liveUrl,
  judges,
  judgesPublished,
  judgingStarted,
  sponsors,
  roster,
  handlers,
}: {
  slug: string;
  showName: string;
  showDate: string;
  status: "upcoming" | "live" | "completed";
  liveUrl?: string;
  judges?: string[];
  judgesPublished?: boolean;
  judgingStarted?: boolean;
  sponsors?: ShowSponsor[];
  roster: RosterFish[];
  handlers: RegisteredHandler[];
}) {
  const stickerHeader: StickerHeader = { showName, date: showDate };
  const [tab, setTab] = useState<TabKey>("scoring");
  const idc = useRef(0);
  const nextId = (p: string) => `${p}-${(idc.current += 1)}`;

  const [divisions, setDivisions] = useState<Division[]>(() =>
    OFFICIAL_DIVISIONS.map((d, i) => ({
      id: `div-seed-${i}`,
      name: d.name,
      abbr: d.abbr,
      group: d.group,
      classes: [],
    })),
  );
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});
  const [officialHandlers, setOfficialHandlers] = useState<string[]>([]);
  const [judgeNames, setJudgeNames] = useState<string[]>(judges ?? []);
  const [judgesPublic, setJudgesPublic] = useState<boolean>(
    judgesPublished ?? false,
  );
  const [liveLink, setLiveLink] = useState(liveUrl ?? "");
  const [judging, setJudging] = useState(judgingStarted ?? false);
  const [sponsorList, setSponsorList] = useState<ShowSponsor[]>(sponsors ?? []);
  const [champions, setChampions] = useState<Record<string, ChampionRound>>({});
  const [majorAwards, setMajorAwards] = useState<MajorAward[]>(
    () => DEFAULT_MAJOR_AWARDS,
  );
  const [payment, setPayment] = useState<PaymentConfig>(DEFAULT_PAYMENT);
  const [proofs, setProofs] = useState<PaymentProof[]>(() => DEMO_PROOFS);

  return (
    <div>
      {/* Start Judging — locks registration & restricts reclass to organizers */}
      <div
        className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
          judging
            ? "border-danger/40 bg-danger/[0.06]"
            : "border-line bg-surface/60"
        }`}
      >
        <div>
          <div className="flex items-center gap-2 font-semibold text-fg">
            {judging ? "🔒 Judging in progress" : "⚖️ Judging not started"}
          </div>
          <div className="text-xs text-muted">
            {judging
              ? "New fish registration is locked. Only organizers can change a fish's division or class."
              : "Starting judging locks new registrations and restricts division/class changes to organizers."}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setJudging((v) => !v)}
          className={
            judging
              ? "inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-fg transition-colors hover:border-gold/50"
              : "inline-flex h-10 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-4 text-sm font-semibold text-ink"
          }
        >
          {judging ? "Reopen registration" : "▶ Start Judging"}
        </button>
      </div>

      {/* Live broadcast link — appears as “Watch Live” on the public show page */}
      <div className="mb-6 rounded-2xl border border-line bg-surface/60 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="shrink-0 text-sm font-semibold text-fg">
            🔴 Live broadcast link
          </span>
          <input
            value={liveLink}
            onChange={(e) => setLiveLink(e.target.value)}
            placeholder="Paste Facebook Live / YouTube URL…"
            className="m-input flex-1 sm:min-w-[260px]"
          />
          {liveLink.trim() && (
            <a
              href={liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-fg transition-colors hover:border-gold/50"
            >
              Open ↗
            </a>
          )}
        </div>
        <p className="mt-2 text-xs text-faint">
          This shows as a <span className="text-fg">🔴 Watch Live</span> button on
          the public show page — add or update it when you go live so viewers can
          tune in.
        </p>
        <ManagerStyles />
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4 ${
              tab === t.key
                ? "border-gold text-gold"
                : "border-transparent text-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "scoring" && (
        <RankingEditor slug={slug} />
      )}

      {tab === "divisions" && (
        <DivisionsPanel
          divisions={divisions}
          setDivisions={setDivisions}
          nextId={nextId}
        />
      )}

      {tab === "champions" && (
        <DivisionChampionsPanel
          divisions={divisions}
          champions={champions}
          setChampions={setChampions}
        />
      )}

      {tab === "majorawards" && (
        <MajorAwardsPanel
          divisions={divisions}
          champions={champions}
          awards={majorAwards}
          setAwards={setMajorAwards}
          nextId={nextId}
        />
      )}

      {tab === "handlers" && (
        <OfficialHandlersPanel
          handlers={handlers}
          official={officialHandlers}
          setOfficial={setOfficialHandlers}
        />
      )}

      {tab === "judges" && (
        <OfficialJudgesPanel
          pool={officialJudges()}
          judges={judgeNames}
          setJudges={setJudgeNames}
          published={judgesPublic}
          setPublished={setJudgesPublic}
        />
      )}

      {tab === "sponsors" && (
        <SponsorsPanel sponsors={sponsorList} setSponsors={setSponsorList} />
      )}

      {tab === "qr" && (
        <QrPanel
          roster={roster}
          divisions={divisions}
          assignments={assignments}
          setAssignments={setAssignments}
          header={stickerHeader}
        />
      )}

      {tab === "labels" && (
        <LabelsPanel
          roster={roster}
          divisions={divisions}
          assignments={assignments}
          header={stickerHeader}
        />
      )}

      {tab === "payment" && (
        <ModeOfPaymentPanel
          payment={payment}
          setPayment={setPayment}
          proofs={proofs}
          setProofs={setProofs}
          cashAllowed={status !== "upcoming"}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Divisions & Classes                                                */
/* ------------------------------------------------------------------ */

function DivisionsPanel({
  divisions,
  setDivisions,
  nextId,
}: {
  divisions: Division[];
  setDivisions: React.Dispatch<React.SetStateAction<Division[]>>;
  nextId: (p: string) => string;
}) {
  const [newDiv, setNewDiv] = useState("");
  const [newAbbr, setNewAbbr] = useState("");
  const [newGroup, setNewGroup] = useState<DivisionGroup>("Open");

  function addDivision() {
    const name = newDiv.trim();
    if (!name) return;
    setDivisions((p) => [
      ...p,
      {
        id: nextId("div"),
        name,
        abbr: newAbbr.trim() || undefined,
        group: newGroup,
        classes: [],
      },
    ]);
    setNewDiv("");
    setNewAbbr("");
  }

  const groups: DivisionGroup[] = ["Regular", "Junior", "Open"];

  return (
    <div>
      <p className="mb-5 text-sm text-muted">
        The official division list is pre-loaded. Add the{" "}
        <span className="text-fg">Classes</span> beneath each (e.g. code{" "}
        <span className="font-mono text-gold">A1</span> with a class name), or
        add &amp; remove divisions to fit your show.
      </p>

      {/* Add division */}
      <div className="mb-6 flex flex-wrap gap-2">
        <input
          value={newDiv}
          onChange={(e) => setNewDiv(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addDivision()}
          placeholder="New division name (e.g. Plakat Division)"
          className="m-input flex-1 sm:min-w-[240px]"
        />
        <input
          value={newAbbr}
          onChange={(e) => setNewAbbr(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addDivision()}
          placeholder="Abbr (e.g. PK)"
          className="m-input w-28"
        />
        <select
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value as DivisionGroup)}
          className="m-input w-32"
        >
          <option value="Regular">Regular</option>
          <option value="Junior">Junior</option>
          <option value="Open">Open</option>
        </select>
        <button type="button" onClick={addDivision} className="btn-gold">
          + Add Division
        </button>
      </div>

      {divisions.length === 0 && (
        <Empty>No divisions yet. Add your first above.</Empty>
      )}

      {groups.map((g) => {
        const inGroup = divisions.filter((d) => d.group === g);
        if (inGroup.length === 0) return null;
        return (
          <div key={g} className="mb-8 last:mb-0">
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                {g} Divisions
              </h3>
              <div className="h-px flex-1 bg-line" />
              <span className="text-xs text-faint">{inGroup.length}</span>
            </div>
            <div className="space-y-4">
              {inGroup.map((div) => (
                <DivisionCard
                  key={div.id}
                  div={div}
                  setDivisions={setDivisions}
                  nextId={nextId}
                />
              ))}
            </div>
          </div>
        );
      })}
      <ManagerStyles />
    </div>
  );
}

function DivisionCard({
  div,
  setDivisions,
  nextId,
}: {
  div: Division;
  setDivisions: React.Dispatch<React.SetStateAction<Division[]>>;
  nextId: (p: string) => string;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  function addClass() {
    if (!code.trim() || !name.trim()) return;
    setDivisions((p) =>
      p.map((d) =>
        d.id === div.id
          ? {
              ...d,
              classes: [
                ...d.classes,
                { id: nextId("cls"), code: code.trim(), name: name.trim() },
              ],
            }
          : d,
      ),
    );
    setCode("");
    setName("");
  }

  function removeClass(cid: string) {
    setDivisions((p) =>
      p.map((d) =>
        d.id === div.id
          ? { ...d, classes: d.classes.filter((c) => c.id !== cid) }
          : d,
      ),
    );
  }

  function removeDivision() {
    setDivisions((p) => p.filter((d) => d.id !== div.id));
  }

  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg font-bold text-fg">{div.name}</h3>
          {div.abbr && (
            <span className="rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-xs font-bold text-gold">
              {div.abbr}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={removeDivision}
          className="shrink-0 text-xs font-medium text-faint hover:text-danger"
        >
          Remove division
        </button>
      </div>

      {/* Classes list */}
      {div.classes.length > 0 && (
        <div className="mt-4 space-y-2">
          {div.classes.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2"
            >
              <span className="inline-flex min-w-10 justify-center rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-xs font-bold text-gold">
                {c.code}
              </span>
              <span className="flex-1 text-sm text-fg">{c.name}</span>
              <button
                type="button"
                onClick={() => removeClass(c.id)}
                className="text-faint hover:text-danger"
                aria-label="Remove class"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add class */}
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Class (e.g. A1)"
          className="m-input w-28"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addClass()}
          placeholder="Class name (e.g. Solid Red - Male)"
          className="m-input flex-1 sm:min-w-[240px]"
        />
        <button type="button" onClick={addClass} className="btn-outline">
          + Add Class
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Division Champions                                                 */
/* ------------------------------------------------------------------ */

function DivisionChampionsPanel({
  divisions,
  champions,
  setChampions,
}: {
  divisions: Division[];
  champions: Record<string, ChampionRound>;
  setChampions: React.Dispatch<
    React.SetStateAction<Record<string, ChampionRound>>
  >;
}) {
  const eligible = divisions.filter((d) => d.classes.length > 0);

  function setWinner(divId: string, classId: string, code: string) {
    setChampions((prev) => {
      const cur = prev[divId] ?? { winners: {} };
      const winners = { ...cur.winners, [classId]: code };
      // Clearing a winner that was the DC also drops the DC.
      const dc = !code.trim() && cur.dc === classId ? undefined : cur.dc;
      return { ...prev, [divId]: { winners, dc } };
    });
  }

  function setDc(divId: string, classId: string) {
    setChampions((prev) => {
      const cur = prev[divId] ?? { winners: {} };
      const dc = cur.dc === classId ? undefined : classId; // single DC, toggle
      return { ...prev, [divId]: { ...cur, dc } };
    });
  }

  return (
    <div>
      <p className="mb-5 text-sm text-muted">
        Each class&apos;s 1st-place winner advances automatically to its Division
        Champion round. Crown the single{" "}
        <span className="text-fg">Division Champion (DC)</span> from the advancing
        finalists — there is only one DC per division.
      </p>

      {eligible.length === 0 && (
        <Empty>
          Add classes to your divisions first (Divisions &amp; Classes tab).
        </Empty>
      )}

      <div className="space-y-4">
        {eligible.map((d) => {
          const round = champions[d.id] ?? { winners: {} };
          const finalists = d.classes.filter((c) =>
            (round.winners[c.id] ?? "").trim(),
          );
          const dcCode = round.dc ? round.winners[round.dc]?.trim() : undefined;

          return (
            <div
              key={d.id}
              className="rounded-2xl border border-line bg-surface/60 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-fg">
                    {d.name}
                  </h3>
                  {d.abbr && (
                    <span className="rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-xs font-bold text-gold">
                      {d.abbr}
                    </span>
                  )}
                </div>
                {dcCode ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold bg-gold/15 px-3 py-1 text-sm font-semibold text-gold-bright">
                    🏆 Division Champion{d.abbr ? ` (${d.abbr})` : ""}:{" "}
                    <span className="font-mono">{dcCode}</span>
                  </span>
                ) : (
                  <span className="text-xs text-faint">No DC crowned yet</span>
                )}
              </div>

              {/* Advancing class winners */}
              <div className="mt-4 space-y-2">
                {d.classes.map((c) => {
                  const code = round.winners[c.id] ?? "";
                  const advanced = code.trim().length > 0;
                  const isDc = round.dc === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5 ${
                        isDc
                          ? "border-gold/50 bg-gold/[0.06]"
                          : "border-line bg-surface-2"
                      }`}
                    >
                      <span className="inline-flex min-w-10 justify-center rounded-md border border-line-strong bg-surface-3 px-2 py-0.5 font-mono text-xs font-bold text-muted">
                        {c.code}
                      </span>
                      <span className="hidden min-w-0 flex-1 truncate text-sm text-muted sm:block">
                        {c.name}
                      </span>
                      <input
                        value={code}
                        onChange={(e) => setWinner(d.id, c.id, e.target.value)}
                        placeholder="1st-place code"
                        className="m-input w-full sm:w-40"
                      />
                      <button
                        type="button"
                        disabled={!advanced}
                        onClick={() => setDc(d.id, c.id)}
                        className={
                          isDc
                            ? "inline-flex h-9 items-center rounded-full border border-gold bg-gold/15 px-3.5 text-sm font-semibold text-gold-bright"
                            : "inline-flex h-9 items-center rounded-full border border-line-strong px-3.5 text-sm font-semibold text-fg disabled:cursor-not-allowed disabled:opacity-40"
                        }
                      >
                        {isDc ? "🏆 DC" : "Crown DC"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-faint">
                {finalists.length} finalist{finalists.length === 1 ? "" : "s"}{" "}
                advancing from {d.classes.length} class
                {d.classes.length === 1 ? "" : "es"}.
              </p>
            </div>
          );
        })}
      </div>
      <ManagerStyles />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Major Awards (Division Champions advance to these)                 */
/* ------------------------------------------------------------------ */

interface DcWinner {
  divId: string;
  name: string;
  abbr?: string;
  code: string;
}

const SOURCE_LABELS: Record<AwardSource, string> = {
  dc: "Division Champions",
  team: "Teams",
  handler: "Handlers",
  special: "Special",
};

function MajorAwardsPanel({
  divisions,
  champions,
  awards,
  setAwards,
  nextId,
}: {
  divisions: Division[];
  champions: Record<string, ChampionRound>;
  awards: MajorAward[];
  setAwards: React.Dispatch<React.SetStateAction<MajorAward[]>>;
  nextId: (p: string) => string;
}) {
  const [newTitle, setNewTitle] = useState("");
  const [newSource, setNewSource] = useState<AwardSource>("special");

  // Pool of crowned Division Champions — the finalists for major awards.
  const dcWinners: DcWinner[] = [];
  for (const d of divisions) {
    const r = champions[d.id];
    const code = r?.dc ? (r.winners[r.dc] ?? "").trim() : "";
    if (code) {
      dcWinners.push({ divId: d.id, name: d.name, abbr: d.abbr, code });
    }
  }

  function winnerLabel(a: MajorAward): string | undefined {
    if (!a.winner) return undefined;
    if (a.source === "dc") {
      const w = dcWinners.find((x) => x.divId === a.winner);
      return w ? `${w.abbr || w.name} · ${w.code}` : undefined;
    }
    return a.winner;
  }

  function patch(id: string, p: Partial<MajorAward>) {
    setAwards((prev) => prev.map((a) => (a.id === id ? { ...a, ...p } : a)));
  }
  function toggleDivision(awardId: string, divId: string) {
    setAwards((prev) =>
      prev.map((a) => {
        if (a.id !== awardId) return a;
        const cur = a.divisions ?? [];
        const divisions = cur.includes(divId)
          ? cur.filter((x) => x !== divId)
          : [...cur, divId];
        // Clear the winner if it's no longer in an included division.
        const winner =
          divisions.length && a.winner && !divisions.includes(a.winner)
            ? undefined
            : a.winner;
        return { ...a, divisions, winner };
      }),
    );
  }
  // Crowned DCs eligible for an award, narrowed to its included divisions.
  function eligibleFor(a: MajorAward): DcWinner[] {
    if (!a.divisions || a.divisions.length === 0) return dcWinners;
    return dcWinners.filter((w) => a.divisions!.includes(w.divId));
  }
  function remove(id: string) {
    setAwards((prev) => prev.filter((a) => a.id !== id));
  }
  function add() {
    const title = newTitle.trim();
    if (!title) return;
    setAwards((prev) => [
      ...prev,
      { id: nextId("ma"), title, source: newSource },
    ]);
    setNewTitle("");
    setNewSource("special");
  }

  return (
    <div>
      <p className="mb-5 text-sm text-muted">
        Division Champions advance to the show&apos;s{" "}
        <span className="text-fg">major awards</span>. Edit any award, crown its
        winner, or add your own special awards.
      </p>

      {/* Eligible DC pool */}
      <div className="mb-6 rounded-2xl border border-gold/30 bg-gold/[0.05] p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Eligible — Division Champions
          </h3>
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-bold text-gold">
            {dcWinners.length}
          </span>
        </div>
        {dcWinners.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {dcWinners.map((w) => (
              <span
                key={w.divId}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-sm text-fg"
              >
                <span className="font-mono text-xs text-gold">
                  {w.abbr || w.name}
                </span>
                {w.code}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-faint">
            No Division Champions crowned yet — crown them in the Division
            Champions tab.
          </p>
        )}
      </div>

      {/* Add major award */}
      <div className="mb-6 flex flex-wrap gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="New award title (e.g. Best in Show)"
          className="m-input flex-1 sm:min-w-[240px]"
        />
        <select
          value={newSource}
          onChange={(e) => setNewSource(e.target.value as AwardSource)}
          className="m-input w-44"
        >
          {(Object.keys(SOURCE_LABELS) as AwardSource[]).map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="button" onClick={add} className="btn-gold">
          + Add Award
        </button>
      </div>

      {/* Award list */}
      <div className="space-y-3">
        {awards.map((a) => {
          const label = winnerLabel(a);
          const eligible = eligibleFor(a);
          const included = a.divisions ?? [];
          return (
            <div
              key={a.id}
              className="rounded-2xl border border-line bg-surface/60 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={a.title}
                  onChange={(e) => patch(a.id, { title: e.target.value })}
                  className="m-input flex-1 sm:min-w-[200px]"
                />
                <select
                  value={a.source}
                  onChange={(e) =>
                    patch(a.id, {
                      source: e.target.value as AwardSource,
                      winner: undefined,
                    })
                  }
                  className="m-input w-44"
                >
                  {(Object.keys(SOURCE_LABELS) as AwardSource[]).map((s) => (
                    <option key={s} value={s}>
                      {SOURCE_LABELS[s]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="flex size-9 items-center justify-center rounded-full border border-line-strong text-faint hover:text-danger"
                  aria-label="Remove award"
                >
                  ✕
                </button>
              </div>

              {/* Included divisions (DC awards only) */}
              {a.source === "dc" && (
                <div className="mt-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-faint">
                    Included divisions{" "}
                    <span className="font-normal normal-case text-faint/80">
                      {included.length === 0
                        ? "— all divisions"
                        : `— ${included.length} selected`}
                    </span>
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {divisions.map((d) => {
                      const on = included.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDivision(a.id, d.id)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                            on
                              ? "border-gold/60 bg-gold/10 text-gold"
                              : "border-line text-muted hover:border-line-strong hover:text-fg"
                          }`}
                        >
                          {d.abbr || d.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Winner picker */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-faint">
                  Winner
                </span>
                {a.source === "dc" ? (
                  <select
                    value={a.winner ?? ""}
                    onChange={(e) =>
                      patch(a.id, { winner: e.target.value || undefined })
                    }
                    className="m-input flex-1 sm:max-w-xs"
                  >
                    <option value="">
                      {eligible.length
                        ? "Select a Division Champion…"
                        : "No eligible Division Champions yet"}
                    </option>
                    {eligible.map((w) => (
                      <option key={w.divId} value={w.divId}>
                        {(w.abbr || w.name) + " — " + w.code}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={a.winner ?? ""}
                    onChange={(e) =>
                      patch(a.id, { winner: e.target.value || undefined })
                    }
                    placeholder={
                      a.source === "team"
                        ? "Winning team…"
                        : a.source === "handler"
                          ? "Winning handler…"
                          : "Winner…"
                    }
                    className="m-input flex-1 sm:max-w-xs"
                  />
                )}
                {label && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold bg-gold/15 px-3 py-1 text-sm font-semibold text-gold-bright">
                    🏅 {a.title}: {label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {awards.length === 0 && <Empty>No major awards yet.</Empty>}
      </div>
      <ManagerStyles />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QR Reclass & Ranking                                               */
/* ------------------------------------------------------------------ */

function QrPanel({
  roster,
  divisions,
  assignments,
  setAssignments,
  header,
}: {
  roster: RosterFish[];
  divisions: Division[];
  assignments: Record<string, Assignment>;
  setAssignments: React.Dispatch<
    React.SetStateAction<Record<string, Assignment>>
  >;
  header: StickerHeader;
}) {
  const [scanned, setScanned] = useState<string>("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [codeQuery, setCodeQuery] = useState("");
  const [codeError, setCodeError] = useState(false);

  const fish = roster.find((f) => f.id === scanned);
  const current = (scanned && assignments[scanned]) || {
    placement: "Unranked",
  };
  const activeDivision = divisions.find((d) => d.id === current.divisionId);
  const needsPhoto = PODIUM.has(current.placement);
  const code = fishCodeFor(scanned ? assignments[scanned] : undefined, divisions);
  const displayName = current.name?.trim() || fish?.name || "";
  const displayOwner = current.owner?.trim() || fish?.owner || "";

  // Plan B: when a thermal QR sticker is faded/unreadable, look the fish up by
  // its entry id or its bench code (e.g. "A1 - 001").
  function lookupByCode() {
    const q = normalizeCode(codeQuery);
    if (!q) return;
    const byId = roster.find((f) => normalizeCode(f.id) === q);
    const byCode = roster.find(
      (f) => normalizeCode(fishCodeFor(assignments[f.id], divisions)) === q,
    );
    const hit = byId ?? byCode;
    if (hit) {
      setScanned(hit.id);
      setCodeError(false);
      setSavedFlash(false);
    } else {
      setCodeError(true);
    }
  }

  const classified = code !== "UNASSIGNED";

  function printOne() {
    if (!fish || !classified) return;
    const sticker: StickerData = {
      code,
      qrValue: `${SITE}/track?code=${encodeURIComponent(code)}`,
    };
    void printStickers([sticker], "thermal", header);
  }

  function update(patch: Partial<Assignment>) {
    if (!scanned) return;
    setAssignments((p) => {
      const prev: Assignment = p[scanned] ?? { placement: "Unranked" };
      return { ...p, [scanned]: { ...prev, ...patch } };
    });
    setSavedFlash(false);
  }

  const awarded = roster
    .map((f) => ({ f, a: assignments[f.id] }))
    .filter((x) => x.a && PODIUM.has(x.a.placement));

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Scanner */}
        <div className="rounded-2xl border border-line bg-surface/60 p-5">
          <div className="flex flex-col items-center text-center">
            <div className="relative grid size-32 grid-cols-6 gap-0.5 rounded-xl border border-gold/30 bg-ink p-2.5">
              {Array.from({ length: 36 }).map((_, i) => {
                const on = [
                  0, 1, 2, 3, 6, 8, 11, 12, 15, 17, 18, 20, 23, 24, 26, 29, 30,
                  31, 33, 35,
                ].includes(i);
                return (
                  <span
                    key={i}
                    className={`rounded-[1px] ${on ? "bg-gold" : ""}`}
                  />
                );
              })}
              <span className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 bg-danger/70 animate-live" />
            </div>
            <p className="mt-3 text-sm font-semibold text-fg">Scan fish QR</p>
            <p className="text-xs text-faint">
              Select an entry to simulate a scan
            </p>
          </div>

          <label className="mt-5 block">
            <span className="lbl">Scan / select entry</span>
            <select
              value={scanned}
              onChange={(e) => {
                setScanned(e.target.value);
                setCodeError(false);
                setSavedFlash(false);
              }}
              className="m-input"
            >
              <option value="">— Select scanned fish —</option>
              {roster.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id} · {f.name}
                </option>
              ))}
            </select>
          </label>

          {/* Plan B — faded sticker fallback */}
          <div className="mt-4 rounded-xl border border-line bg-surface-2/60 p-3">
            <span className="lbl">QR faded? Enter fish code</span>
            <div className="flex gap-2">
              <input
                value={codeQuery}
                onChange={(e) => {
                  setCodeQuery(e.target.value);
                  setCodeError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && lookupByCode()}
                placeholder="e.g. A1 - 001"
                className="m-input flex-1"
              />
              <button type="button" onClick={lookupByCode} className="btn-outline">
                Find
              </button>
            </div>
            {codeError && (
              <p className="mt-1.5 text-xs text-danger">
                No entry matches that code. Check the class &amp; tank number.
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-faint">
              Thermal stickers can fade from water — look the fish up by its
              bench code instead.
            </p>
          </div>
        </div>

        {/* Detail / actions */}
        <div className="rounded-2xl border border-line bg-surface/60 p-5">
          {!fish ? (
            <div className="flex h-full min-h-48 items-center justify-center text-center text-sm text-faint">
              Scan a QR or enter a fish code to edit the entry.
            </div>
          ) : (
            <div>
              {/* Identity + live QR + bench code */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="lbl">Bench code</span>
                  <div className="font-display text-2xl font-extrabold text-gold">
                    {code}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    <span className="font-mono text-xs">{fish.id}</span> ·{" "}
                    Orig. {fish.category}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="rounded-lg border border-line bg-white p-1.5">
                    <QrCode
                      value={`${SITE}/track?code=${encodeURIComponent(code)}`}
                      size={72}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={printOne}
                    disabled={!classified}
                    className="mt-2 text-xs font-semibold text-gold hover:text-gold-bright disabled:cursor-not-allowed disabled:text-faint"
                    title={
                      classified
                        ? undefined
                        : "Assign a class & tank number first"
                    }
                  >
                    🖨 Print sticker
                  </button>
                </div>
              </div>

              {/* Edit core fields */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="lbl">Fish name</span>
                  <input
                    value={displayName}
                    onChange={(e) => update({ name: e.target.value })}
                    className="m-input"
                  />
                </label>
                <label className="block">
                  <span className="lbl">Owner</span>
                  <input
                    value={displayOwner}
                    onChange={(e) => update({ owner: e.target.value })}
                    className="m-input"
                  />
                </label>
              </div>

              {/* Reclass + tank → bench code */}
              <div className="mt-5">
                <span className="lbl">Reclass &amp; tank assignment</span>
                <div className="grid gap-2 sm:grid-cols-3">
                  <select
                    value={current.divisionId ?? ""}
                    onChange={(e) =>
                      update({ divisionId: e.target.value, classId: undefined })
                    }
                    className="m-input"
                  >
                    <option value="">Division…</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={current.classId ?? ""}
                    onChange={(e) => update({ classId: e.target.value })}
                    disabled={!activeDivision || activeDivision.classes.length === 0}
                    className="m-input disabled:opacity-50"
                  >
                    <option value="">
                      {activeDivision && activeDivision.classes.length === 0
                        ? "No classes"
                        : "Class…"}
                    </option>
                    {activeDivision?.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={current.tank ?? ""}
                    onChange={(e) => update({ tank: e.target.value })}
                    placeholder="Tank No. (001)"
                    className="m-input"
                  />
                </div>
                <p className="mt-1.5 text-xs text-faint">
                  Bench code becomes{" "}
                  <span className="font-mono font-semibold text-gold">{code}</span>{" "}
                  (Class + Tank No.).
                </p>
              </div>

              {/* Placement */}
              <div className="mt-5">
                <span className="lbl">Ranking / placement</span>
                <div className="flex flex-wrap gap-2">
                  {PLACEMENTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => update({ placement: p })}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        current.placement === p
                          ? "border-gold/60 bg-gold/10 text-gold"
                          : "border-line text-muted hover:border-line-strong hover:text-fg"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Winning photo */}
              {needsPhoto && (
                <div className="mt-5 rounded-xl border border-gold/30 bg-gold/[0.05] p-4">
                  <PhotoInput
                    label="Winning fish photo (required for podium / award)"
                    value={current.photo}
                    onChange={(url) => update({ photo: url })}
                    shape="wide"
                  />
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSavedFlash(true)}
                  className="btn-gold"
                >
                  Save &amp; update rankings
                </button>
                {savedFlash && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                    ✓ {fish.name} updated
                    {current.divisionId
                      ? ` → ${divisions.find((d) => d.id === current.divisionId)?.name}`
                      : ""}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Awarded gallery */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold text-fg">
          Podium Winners
        </h3>
        <p className="mt-1 text-sm text-muted">
          Ranked fish (1st / 2nd / 3rd) with their winning photos — these publish
          to the live results.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {awarded.map(({ f, a }) => (
            <div
              key={f.id}
              className="overflow-hidden rounded-2xl border border-line bg-surface/60"
            >
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-surface-3 to-ink">
                {a!.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a!.photo}
                    alt={f.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🐟</span>
                )}
              </div>
              <div className="p-4">
                <span className="rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold">
                  {a!.placement}
                </span>
                <p className="mt-1.5 font-semibold text-fg">{f.name}</p>
                <p className="text-xs text-muted">{f.owner}</p>
              </div>
            </div>
          ))}
          {awarded.length === 0 && <Empty>No ranked fish yet.</Empty>}
        </div>
      </div>
      <ManagerStyles />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Labels & Stickers                                                  */
/* ------------------------------------------------------------------ */

const FORMATS: { key: LabelFormat; label: string }[] = [
  { key: "thermal", label: "Thermal 50×30" },
  { key: "label40x60", label: "Label 40×60" },
  { key: "zebra", label: "Zebra 57×32" },
  { key: "a4", label: "A4 Sheet" },
];

function LabelsPanel({
  roster,
  divisions,
  assignments,
  header,
}: {
  roster: RosterFish[];
  divisions: Division[];
  assignments: Record<string, Assignment>;
  header: StickerHeader;
}) {
  const [format, setFormat] = useState<LabelFormat>("thermal");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Only classified entries get labels — unclassified ones are excluded.
  const stickers = useMemo(
    () =>
      roster
        .map((f) => {
          const a = assignments[f.id];
          const code = fishCodeFor(a, divisions);
          return {
            fishId: f.id,
            code,
            fishName: a?.name?.trim() || f.name,
            owner: a?.owner?.trim() || f.owner,
            qrValue: `${SITE}/track?code=${encodeURIComponent(code)}`,
          };
        })
        .filter((s) => s.code !== "UNASSIGNED"),
    [roster, assignments, divisions],
  );

  const sample = stickers[0];

  // The checked batch, preserving list order (stale ids are simply ignored).
  const batch = stickers.filter((s) => selected.has(s.fishId));
  const allChecked = stickers.length > 0 && batch.length === stickers.length;
  const batchName = `finoy-labels-${format}-${batch.length}.html`;

  // Every QR encodes the entry's official bench code (…/track?code=CODE), so a
  // duplicate code means a duplicate QR. Detect collisions and block batch
  // printing until each code — and therefore each QR — is unique.
  const codeCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stickers) m.set(s.code, (m.get(s.code) ?? 0) + 1);
    return m;
  }, [stickers]);
  const duplicateCodes = [...codeCounts.entries()]
    .filter(([, n]) => n > 1)
    .map(([c]) => c);
  const hasDuplicates = duplicateCodes.length > 0;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected(
      allChecked ? new Set() : new Set(stickers.map((s) => s.fishId)),
    );
  }

  return (
    <div>
      <p className="mb-5 text-sm text-muted">
        Tick the entries you want, then{" "}
        <span className="text-fg">print the batch in one job</span> — or compress
        the selection into a single file you can feed to any printer later. Every
        QR is <span className="text-fg">unique</span> and opens that entry&apos;s{" "}
        <span className="text-fg">official bench code</span> in the public
        tracker. Each label also carries the show name &amp; date, the bold bench
        code, and an “A Finoy Masterpiece” footer.
      </p>

      {hasDuplicates && (
        <div className="mb-4 rounded-xl border border-danger/40 bg-danger/[0.07] px-4 py-3 text-sm">
          <p className="font-semibold text-danger">
            ⚠ Duplicate bench codes — QRs would not be unique
          </p>
          <p className="mt-0.5 text-danger/90">
            Each QR must map to exactly one code. Give a unique class + tank
            number to{" "}
            <span className="font-mono">{duplicateCodes.join(", ")}</span> in the
            QR Scan &amp; Edit tab before printing.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          {/* Format + print-all */}
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div className="flex gap-1.5">
              {FORMATS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFormat(f.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    format === f.key
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-line text-muted hover:border-line-strong hover:text-fg"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={stickers.length === 0 || hasDuplicates}
              onClick={() => void printStickers(stickers, format, header)}
              className="btn-outline disabled:pointer-events-none disabled:opacity-40"
            >
              🖨 Print all ({stickers.length})
            </button>
          </div>

          {/* Batch selection toolbar */}
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-surface-2/50 px-4 py-2.5">
            <label className="flex items-center gap-2 text-sm font-medium text-fg">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                disabled={stickers.length === 0}
                className="size-4 accent-gold"
              />
              Select all
            </label>
            <span className="text-xs text-faint">
              {batch.length} of {stickers.length} selected
            </span>
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                disabled={batch.length === 0 || hasDuplicates}
                onClick={() => void printStickers(batch, format, header)}
                className="btn-gold disabled:pointer-events-none disabled:opacity-40"
              >
                🖨 Print selected ({batch.length})
              </button>
              <button
                type="button"
                disabled={batch.length === 0 || hasDuplicates}
                onClick={() =>
                  void downloadStickerBatch(batch, format, header, batchName)
                }
                className="btn-outline disabled:pointer-events-none disabled:opacity-40"
              >
                🗜 Save batch file
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-surface/60">
            {stickers.map((s) => {
              const checked = selected.has(s.fishId);
              const dup = (codeCounts.get(s.code) ?? 0) > 1;
              return (
                <div
                  key={s.fishId}
                  onClick={() => toggle(s.fishId)}
                  className={`flex cursor-pointer items-center gap-3 border-b border-line/50 px-4 py-3 last:border-0 ${
                    dup
                      ? "bg-danger/[0.06]"
                      : checked
                        ? "bg-gold/[0.06]"
                        : "hover:bg-surface-2"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(s.fishId)}
                    onClick={(e) => e.stopPropagation()}
                    className="size-4 accent-gold"
                  />
                  <span className="flex w-24 shrink-0 flex-col font-mono text-sm font-bold text-gold">
                    {s.code}
                    {dup && (
                      <span className="font-sans text-[10px] font-semibold uppercase tracking-wide text-danger">
                        duplicate
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-fg">
                      {s.fishName}
                    </div>
                    <div className="truncate text-xs text-muted">{s.owner}</div>
                  </div>
                  <button
                    type="button"
                    disabled={dup}
                    onClick={(e) => {
                      e.stopPropagation();
                      void printStickers([s], format, header);
                    }}
                    className="btn-outline disabled:pointer-events-none disabled:opacity-40"
                  >
                    Print
                  </button>
                </div>
              );
            })}
            {stickers.length === 0 && <Empty>No entries to label.</Empty>}
          </div>
        </div>

        {/* Live sticker preview (white, as printed) */}
        <div>
          <span className="lbl">Sticker preview</span>
          {sample ? (
            <StickerPreview data={sample} header={header} />
          ) : (
            <Empty>
              No classified entries yet — assign a class &amp; tank number in the
              QR tab.
            </Empty>
          )}
          <p className="mt-3 text-xs text-faint">
            Tip: assign each fish a class &amp; tank number in the QR tab so the
            bold bench code (e.g.{" "}
            <span className="font-mono text-gold">A1 - 001</span>) prints
            correctly.
          </p>
        </div>
      </div>
      <ManagerStyles />
    </div>
  );
}

function StickerPreview({
  data,
  header,
}: {
  data: StickerData;
  header: StickerHeader;
}) {
  return (
    <div
      className="rounded-lg bg-white p-3 text-black shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]"
      style={{ maxWidth: 280 }}
    >
      {/* Header — show name + date */}
      <div className="flex items-baseline justify-between gap-2 border-b border-black pb-1">
        <span className="truncate text-[11px] font-extrabold uppercase tracking-wide">
          {header.showName}
        </span>
        <span className="shrink-0 text-[10px] font-semibold">
          {header.date}
        </span>
      </div>

      {/* QR + big bold code */}
      <div className="mt-2 flex items-center gap-3">
        <div className="size-[72px] shrink-0">
          <QrCode value={data.qrValue} size={72} />
        </div>
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-5xl font-black leading-none tracking-tight">
            {data.code}
          </div>
          <div className="mt-1 text-[10px] text-neutral-500">Class + Tank No.</div>
        </div>
      </div>

      <div className="mt-2 border-t border-black pt-1 text-center text-[10px]">
        A <b className="font-extrabold">Finoy</b> Masterpiece
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Official Handlers                                                   */
/* ------------------------------------------------------------------ */

function OfficialHandlersPanel({
  handlers,
  official,
  setOfficial,
}: {
  handlers: RegisteredHandler[];
  official: string[];
  setOfficial: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [q, setQ] = useState("");

  function toggle(id: string) {
    setOfficial((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  }

  const filtered = handlers.filter(
    (h) =>
      h.name.toLowerCase().includes(q.toLowerCase()) ||
      h.alias.toLowerCase().includes(q.toLowerCase()) ||
      h.region.toLowerCase().includes(q.toLowerCase()),
  );
  const officials = handlers.filter((h) => official.includes(h.id));

  return (
    <div>
      <p className="mb-5 text-sm text-muted">
        Handlers register themselves in the national pool. Add the ones working
        your floor as <span className="text-fg">official handlers</span> for this
        show — they gain bench-in/out rights and appear on entry labels.
      </p>

      {/* Officials summary */}
      <div className="mb-6 rounded-2xl border border-gold/30 bg-gold/[0.05] p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-fg">
            Official handlers for this show
          </h3>
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-bold text-gold">
            {officials.length}
          </span>
        </div>
        {officials.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {officials.map((h) => (
              <span
                key={h.id}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 py-1 pl-3 pr-1.5 text-sm text-fg"
              >
                {h.name}
                <button
                  type="button"
                  onClick={() => toggle(h.id)}
                  className="flex size-5 items-center justify-center rounded-full bg-surface-3 text-faint hover:text-danger"
                  aria-label={`Remove ${h.name}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-faint">
            None yet — add handlers from the pool below.
          </p>
        )}
      </div>

      {/* Search */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search registered handlers by name, alias, or region…"
        className="m-input mb-4"
      />

      {/* Pool */}
      <div className="space-y-2.5">
        {filtered.map((h) => {
          const isOfficial = official.includes(h.id);
          return (
            <div
              key={h.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface/60 p-4"
            >
              <span className="flex size-11 items-center justify-center rounded-full border border-line bg-surface-2 font-display text-sm font-bold text-muted">
                {h.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-fg">{h.name}</span>
                  <span className="text-sm text-muted">“{h.alias}”</span>
                  {h.status === "verified" ? (
                    <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full border border-line bg-surface-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">
                      Applicant
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted">
                  {h.region} · {h.experience} yr
                  {h.experience === 1 ? "" : "s"} · {h.specialty}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggle(h.id)}
                className={
                  isOfficial
                    ? "inline-flex h-10 items-center rounded-full border border-gold/50 bg-gold/10 px-4 text-sm font-semibold text-gold"
                    : "inline-flex h-10 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-4 text-sm font-semibold text-ink"
                }
              >
                {isOfficial ? "✓ Official" : "+ Add as Official"}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && <Empty>No handlers match your search.</Empty>}
      </div>
      <ManagerStyles />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Official Judges                                                     */
/* ------------------------------------------------------------------ */

function OfficialJudgesPanel({
  pool,
  judges,
  setJudges,
  published,
  setPublished,
}: {
  pool: Account[];
  judges: string[];
  setJudges: React.Dispatch<React.SetStateAction<string[]>>;
  published: boolean;
  setPublished: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [name, setName] = useState("");

  function add(n: string) {
    const v = n.trim();
    if (!v || judges.some((j) => j.toLowerCase() === v.toLowerCase())) return;
    setJudges((p) => [...p, v]);
  }
  function remove(n: string) {
    setJudges((p) => p.filter((j) => j !== n));
  }

  // Labelled judges (Super Admin) not yet on the panel — offered as quick-adds.
  const quickAdd = pool.filter(
    (a) => !judges.some((j) => j.toLowerCase() === a.name.toLowerCase()),
  );

  return (
    <div>
      <p className="mb-5 text-sm text-muted">
        Build your panel of judges for this show, then choose whether to publish
        their names publicly now or keep them private until show day — handy when
        the line-up is still changing.
      </p>

      {/* Publish status / toggle */}
      <div
        className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
          published
            ? "border-success/40 bg-success/[0.06]"
            : "border-line bg-surface-2/50"
        }`}
      >
        <div>
          <div className="font-semibold text-fg">
            {published
              ? "✓ Judges published"
              : "Judges not published yet"}
          </div>
          <div className="text-xs text-muted">
            {published
              ? "Their names appear on the public show page."
              : "Hidden from the public — publish once your panel is final."}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPublished((v) => !v)}
          disabled={!published && judges.length === 0}
          className={
            published
              ? "inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-fg transition-colors hover:border-danger/50 hover:text-danger"
              : "inline-flex h-10 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-4 text-sm font-semibold text-ink disabled:pointer-events-none disabled:opacity-40"
          }
        >
          {published ? "Unpublish" : "📣 Publish judges"}
        </button>
      </div>

      {/* Add a judge by name */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(name);
              setName("");
            }
          }}
          placeholder="Add a judge by name…"
          className="m-input flex-1 sm:min-w-[260px]"
        />
        <button
          type="button"
          onClick={() => {
            add(name);
            setName("");
          }}
          className="inline-flex h-10 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-4 text-sm font-semibold text-ink"
        >
          + Add judge
        </button>
      </div>

      {/* Quick-add from labelled judges */}
      {quickAdd.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
            Labelled judges — tap to add
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAdd.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => add(a.name)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-sm text-muted transition-colors hover:border-gold/50 hover:text-fg"
              >
                + {a.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current panel */}
      <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-fg">
            Judges panel for this show
          </h3>
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-bold text-gold">
            {judges.length}
          </span>
        </div>
        {judges.length > 0 ? (
          <div className="mt-3 space-y-2">
            {judges.map((j) => (
              <div
                key={j}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-2.5"
              >
                <span className="flex size-9 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-sm">
                  ⚖️
                </span>
                <span className="flex-1 font-semibold text-fg">{j}</span>
                <button
                  type="button"
                  onClick={() => remove(j)}
                  className="text-faint hover:text-danger"
                  aria-label={`Remove ${j}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-faint">
            No judges added yet — add by name above, or tap a labelled judge.
          </p>
        )}
      </div>
      <ManagerStyles />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sponsors                                                           */
/* ------------------------------------------------------------------ */

function SponsorsPanel({
  sponsors,
  setSponsors,
}: {
  sponsors: ShowSponsor[];
  setSponsors: React.Dispatch<React.SetStateAction<ShowSponsor[]>>;
}) {
  const [name, setName] = useState("");
  const [tier, setTier] = useState<"major" | "minor">("major");
  const [logo, setLogo] = useState<string | undefined>();
  const seq = useRef(1);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const v = name.trim();
    if (!v) return;
    setSponsors((p) => [
      ...p,
      { id: `sp-new-${seq.current++}`, name: v, tier, logo },
    ]);
    setName("");
    setLogo(undefined);
  }
  function remove(id: string) {
    setSponsors((p) => p.filter((s) => s.id !== id));
  }

  const major = sponsors.filter((s) => s.tier === "major");
  const minor = sponsors.filter((s) => s.tier === "minor");

  return (
    <div>
      <p className="mb-5 text-sm text-muted">
        Add your show&apos;s <span className="text-fg">Major</span> and{" "}
        <span className="text-fg">Minor</span> sponsors. Their logo &amp; name
        appear on the public show page — free advertising for backing your event.
      </p>

      {/* Add sponsor */}
      <form
        onSubmit={add}
        className="mb-6 rounded-2xl border border-line bg-surface-2/50 p-4"
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line-strong bg-surface text-center text-[11px] text-faint hover:border-gold/50">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt="logo"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="px-1">＋ Logo</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () =>
                  typeof reader.result === "string" && setLogo(reader.result);
                reader.readAsDataURL(file);
              }}
            />
          </label>

          <label className="flex-1 sm:min-w-[200px]">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-faint">
              Sponsor name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AquaPro PH"
              className="m-input"
            />
          </label>

          <div>
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-faint">
              Tier
            </span>
            <div className="flex gap-1.5">
              {(["major", "minor"] as const).map((tval) => (
                <button
                  key={tval}
                  type="button"
                  onClick={() => setTier(tval)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    tier === tval
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-line text-muted hover:border-line-strong hover:text-fg"
                  }`}
                >
                  {tval}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="btn-gold disabled:pointer-events-none disabled:opacity-40"
          >
            + Add sponsor
          </button>
        </div>
      </form>

      <SponsorGroup title="Major Sponsors" items={major} onRemove={remove} big />
      <SponsorGroup title="Minor Sponsors" items={minor} onRemove={remove} />

      {sponsors.length === 0 && (
        <Empty>No sponsors yet — add your first one above.</Empty>
      )}
      <ManagerStyles />
    </div>
  );
}

function SponsorGroup({
  title,
  items,
  onRemove,
  big = false,
}: {
  title: string;
  items: ShowSponsor[];
  onRemove: (id: string) => void;
  big?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        {title}
        <span className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[10px] text-faint">
          {items.length}
        </span>
      </div>
      <div className={`grid gap-3 ${big ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {items.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface/60 p-3"
          >
            <div
              className={`flex ${
                big ? "size-14" : "size-11"
              } shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white`}
            >
              {s.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.logo}
                  alt={s.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-lg">🏷️</span>
              )}
            </div>
            <span className="min-w-0 flex-1 truncate font-semibold text-fg">
              {s.name}
            </span>
            <button
              type="button"
              onClick={() => onRemove(s.id)}
              className="text-faint hover:text-danger"
              aria-label={`Remove ${s.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mode of Payment                                                    */
/* ------------------------------------------------------------------ */

// A unique one-time cash code so an organizer can settle a player's whole batch
// of entries in one go — no typing each entry code. Uniqueness comes from the
// running sequence; the token just makes it look like a real receipt code.
function oneTimeCashCode(seq: number, seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const token = (h >>> 0).toString(36).toUpperCase().slice(0, 4).padStart(4, "0");
  return `CASH-${String(seq).padStart(3, "0")}-${token}`;
}

function ModeOfPaymentPanel({
  payment,
  setPayment,
  proofs,
  setProofs,
  cashAllowed,
}: {
  payment: PaymentConfig;
  setPayment: React.Dispatch<React.SetStateAction<PaymentConfig>>;
  proofs: PaymentProof[];
  setProofs: React.Dispatch<React.SetStateAction<PaymentProof[]>>;
  cashAllowed: boolean; // cash only during the show proper / walk-in
}) {
  const [showCash, setShowCash] = useState(false);
  const [cashOverride, setCashOverride] = useState(false);
  const [cashForm, setCashForm] = useState({
    player: "",
    entries: "1",
    amount: "",
  });
  const [lastCashCode, setLastCashCode] = useState<string | null>(null);
  const cashSeq = useRef(1);

  // Cash is auto-on during the show proper, but the organizer can switch it on
  // anytime (e.g. bench-in day, when walk-ins start arriving early).
  const canCash = cashAllowed || cashOverride;

  function set(k: keyof PaymentConfig, v: string) {
    setPayment((p) => ({ ...p, [k]: v }));
  }
  function setStatus(id: string, status: PaymentProof["status"]) {
    setProofs((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }
  const pendingCount = proofs.filter((p) => p.status === "pending").length;

  // Cash vs digital breakdown — only confirmed (collected) payments count.
  const isCash = (m: string) => m.toLowerCase() === "cash";
  const confirmed = proofs.filter((p) => p.status === "confirmed");
  const cash = confirmed.filter((p) => isCash(p.method));
  const digital = confirmed.filter((p) => !isCash(p.method));
  const cashTotal = cash.reduce((s, p) => s + p.amount, 0);
  const digitalTotal = digital.reduce((s, p) => s + p.amount, 0);

  function recordCash(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(cashForm.amount);
    const entries = Math.max(1, Math.round(Number(cashForm.entries) || 1));
    // Cash must be enabled (show proper or organizer override) + valid amount.
    if (!canCash || !cashForm.player.trim() || !amount || amount <= 0) return;
    const seq = cashSeq.current++;
    // One code for the whole batch — the organizer never types each entry code.
    const code = oneTimeCashCode(seq, `${cashForm.player}|${entries}|${amount}`);
    setProofs((prev) => [
      {
        id: `cash-${seq}`,
        entryCode: code,
        player: cashForm.player.trim(),
        amount,
        method: "Cash",
        status: "confirmed",
        entries,
      },
      ...prev,
    ]);
    setLastCashCode(code);
    setCashForm({ player: "", entries: "1", amount: "" });
    setShowCash(false);
  }

  return (
    <div>
      <p className="mb-5 text-sm text-muted">
        Set the channels players pay their fish-code fees to. Players send
        payment, post proof to your Facebook, upload a screenshot, and you
        confirm it below.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Config form */}
        <div className="space-y-5 rounded-2xl border border-line bg-surface/60 p-5">
          <ChannelBlock title="GCash" icon="📱">
            <PayField
              label="Account name"
              value={payment.gcashName}
              onChange={(v) => set("gcashName", v)}
              placeholder="Juan Dela Cruz"
            />
            <PayField
              label="GCash number"
              value={payment.gcashNumber}
              onChange={(v) => set("gcashNumber", v)}
              placeholder="0917 123 4567"
            />
          </ChannelBlock>

          <ChannelBlock title="PayMaya / Maya" icon="💳">
            <PayField
              label="Account name"
              value={payment.mayaName}
              onChange={(v) => set("mayaName", v)}
              placeholder="Juan Dela Cruz"
            />
            <PayField
              label="Maya number"
              value={payment.mayaNumber}
              onChange={(v) => set("mayaNumber", v)}
              placeholder="0918 765 4321"
            />
          </ChannelBlock>

          <ChannelBlock title="Bank Account" icon="🏦">
            <PayField
              label="Bank"
              value={payment.bankName}
              onChange={(v) => set("bankName", v)}
              placeholder="BPI / BDO / UnionBank"
            />
            <PayField
              label="Account name"
              value={payment.bankAccountName}
              onChange={(v) => set("bankAccountName", v)}
              placeholder="Juan Dela Cruz"
            />
            <PayField
              label="Account number"
              value={payment.bankAccountNumber}
              onChange={(v) => set("bankAccountNumber", v)}
              placeholder="1234 5678 90"
            />
          </ChannelBlock>

          <ChannelBlock title="Facebook (payment confirmation)" icon="📘">
            <PayField
              label="Facebook page / profile"
              value={payment.facebook}
              onChange={(v) => set("facebook", v)}
              placeholder="fb.com/YourShowPage"
            />
          </ChannelBlock>

          {/* Scan-to-pay QR upload */}
          <div className="rounded-xl border border-line bg-surface-2/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
              <span>🔳</span> Scan-to-pay QR code
            </div>
            <div className="flex items-center gap-4">
              <label className="flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line-strong bg-surface text-center text-xs text-faint transition-colors hover:border-gold/50">
                {payment.qrImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={payment.qrImage}
                    alt="payment QR"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="px-2">＋ Upload QR</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () =>
                      typeof reader.result === "string" &&
                      set("qrImage", reader.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">
                  Upload your GCash / Maya / bank QR. Players can scan it to pay
                  directly during registration.
                </p>
                {payment.qrImage && (
                  <button
                    type="button"
                    onClick={() => set("qrImage", "")}
                    className="mt-2 text-xs font-semibold text-faint hover:text-danger"
                  >
                    Remove QR
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Player-facing preview */}
        <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            How players see it
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            <PreviewLine
              label="GCash"
              value={
                payment.gcashNumber
                  ? `${payment.gcashNumber}${payment.gcashName ? ` · ${payment.gcashName}` : ""}`
                  : undefined
              }
            />
            <PreviewLine
              label="PayMaya"
              value={
                payment.mayaNumber
                  ? `${payment.mayaNumber}${payment.mayaName ? ` · ${payment.mayaName}` : ""}`
                  : undefined
              }
            />
            <PreviewLine
              label="Bank"
              value={
                payment.bankAccountNumber
                  ? `${payment.bankName} ${payment.bankAccountNumber}${payment.bankAccountName ? ` · ${payment.bankAccountName}` : ""}`
                  : undefined
              }
            />
            <PreviewLine label="Confirm via FB" value={payment.facebook || undefined} />
            {payment.qrImage && (
              <div className="border-t border-gold/20 pt-3">
                <div className="text-faint">Scan-to-pay QR</div>
                <div className="mt-2 inline-block rounded-lg border border-line bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={payment.qrImage}
                    alt="payment QR"
                    className="size-28 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-faint">
            After paying, the player uploads a screenshot of the transaction for
            you to confirm.
          </p>
        </div>
      </div>

      {/* Collected: cash vs digital + record walk-in cash */}
      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-fg">
            Collected payments
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {/* Organizer can switch cash on anytime (e.g. bench-in walk-ins). */}
            {!cashAllowed && (
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted">
                <input
                  type="checkbox"
                  checked={cashOverride}
                  onChange={(e) => setCashOverride(e.target.checked)}
                  className="size-4 accent-gold"
                />
                Accept cash now
              </label>
            )}
            {canCash ? (
              <button
                type="button"
                onClick={() => setShowCash((v) => !v)}
                className="inline-flex h-9 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-fg transition-colors hover:border-gold/50"
              >
                💵 Record walk-in cash
              </button>
            ) : (
              <span
                title="Enable “Accept cash now” to take walk-in cash"
                className="inline-flex h-9 cursor-not-allowed items-center rounded-full border border-line px-4 text-sm font-semibold text-faint"
              >
                💵 Cash — online-only before show
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "💵", label: "Cash collected", value: peso(cashTotal), sub: `${cash.length} walk-in`, accent: true },
            { icon: "🏦", label: "Digital (bank / e-wallet)", value: peso(digitalTotal), sub: `${digital.length} online`, accent: false },
            { icon: "Σ", label: "Total collected", value: peso(cashTotal + digitalTotal), sub: "confirmed only", accent: false },
          ].map((c) => (
            <div
              key={c.label}
              className={`rounded-2xl border p-4 ${
                c.accent ? "border-gold/40 bg-gold/[0.05]" : "border-line bg-surface/60"
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-faint">
                <span>{c.icon}</span> {c.label}
              </div>
              <div
                className={`mt-1 font-display text-2xl font-bold tabular-nums ${
                  c.accent ? "text-gold" : "text-fg"
                }`}
              >
                {c.value}
              </div>
              <div className="text-xs text-faint">{c.sub}</div>
            </div>
          ))}
        </div>

        {showCash && canCash && (
          <form
            onSubmit={recordCash}
            className="mt-4 rounded-2xl border border-line bg-surface-2/50 p-4"
          >
            <p className="mb-3 text-xs text-muted">
              Enter the player and how many entries they&apos;re settling. We&apos;ll
              issue <span className="text-fg">one cash code</span> for the whole
              batch — no need to type each entry code.
            </p>
            <div className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
              <input
                value={cashForm.player}
                onChange={(e) =>
                  setCashForm((f) => ({ ...f, player: e.target.value }))
                }
                placeholder="Player name"
                className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-fg outline-none focus:border-gold/60"
              />
              <input
                type="number"
                min="1"
                value={cashForm.entries}
                onChange={(e) =>
                  setCashForm((f) => ({ ...f, entries: e.target.value }))
                }
                placeholder="# entries"
                className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-fg outline-none focus:border-gold/60"
              />
              <input
                type="number"
                min="0"
                value={cashForm.amount}
                onChange={(e) =>
                  setCashForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="₱ total"
                className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-fg outline-none focus:border-gold/60"
              />
              <button
                type="submit"
                disabled={!cashForm.player.trim() || !Number(cashForm.amount)}
                className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-5 text-sm font-semibold text-ink disabled:pointer-events-none disabled:opacity-40"
              >
                Issue cash code
              </button>
            </div>
          </form>
        )}

        {lastCashCode && (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm">
            <span className="font-semibold text-success">✓ Cash recorded</span>
            <span className="text-muted">One-time code:</span>
            <span className="font-mono text-base font-bold text-gold">
              {lastCashCode}
            </span>
            <span className="text-xs text-faint">
              Give this to the player as their receipt — it covers all their paid
              entries.
            </span>
            <button
              type="button"
              onClick={() => setLastCashCode(null)}
              className="ml-auto text-xs font-semibold text-faint hover:text-fg"
            >
              Dismiss
            </button>
          </div>
        )}
        <p className="mt-2 text-xs text-faint">
          {canCash
            ? `Walk-in cash is logged as collected immediately against the player’s code. Digital payments are collected once you confirm their uploaded proof below.${
                !cashAllowed ? " (Cash manually enabled by the organizer.)" : ""
              }`
            : "Payments default to online-only before the show. Flip “Accept cash now” to take walk-in cash anytime — e.g. on bench-in day — by having the player present their code."}
        </p>
      </div>

      {/* Pending confirmations */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <h3 className="font-display text-lg font-bold text-fg">
            Payment Confirmations
          </h3>
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-bold text-gold">
            {pendingCount} pending
          </span>
        </div>
        <div className="space-y-3">
          {proofs.map((pf) => (
            <div
              key={pf.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface/60 p-4"
            >
              {/* Screenshot thumb */}
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-2 text-2xl">
                {pf.screenshot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pf.screenshot}
                    alt="payment proof"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "🧾"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-sm font-bold text-gold">
                  {pf.entryCode}
                </div>
                <div className="text-xs text-muted">
                  {pf.player} · {pf.method}
                  {pf.entries
                    ? ` · ${pf.entries} ${pf.entries === 1 ? "entry" : "entries"}`
                    : ""}{" "}
                  · {peso(pf.amount)}
                </div>
              </div>
              {pf.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(pf.id, "confirmed")}
                    className="inline-flex h-9 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-4 text-sm font-semibold text-ink"
                  >
                    ✓ Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(pf.id, "rejected")}
                    className="inline-flex h-9 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-fg hover:text-danger"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                    pf.status === "confirmed"
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-danger/40 bg-danger/10 text-danger"
                  }`}
                >
                  {pf.status === "confirmed" ? "✓ Confirmed" : "Rejected"}
                </span>
              )}
            </div>
          ))}
          {proofs.length === 0 && <Empty>No payment proofs submitted yet.</Empty>}
        </div>
      </div>
      <ManagerStyles />
    </div>
  );
}

function ChannelBlock({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-2/60 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
        <span>{icon}</span>
        {title}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function PayField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="lbl">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="m-input"
      />
    </label>
  );
}

function PreviewLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line/50 pb-2 last:border-0">
      <span className="text-faint">{label}</span>
      <span className={`text-right font-medium ${value ? "text-fg" : "text-faint"}`}>
        {value || "Not set"}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared bits                                                        */
/* ------------------------------------------------------------------ */

function PhotoInput({
  label,
  value,
  onChange,
  shape,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  shape: "square" | "wide";
}) {
  return (
    <div>
      <span className="lbl">{label}</span>
      <div className="flex items-center gap-4">
        <label
          className={`flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line-strong bg-surface-2 text-center text-xs text-faint transition-colors hover:border-gold/50 ${
            shape === "square" ? "size-24" : "h-24 w-40"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2">＋ Upload</span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(URL.createObjectURL(file));
            }}
          />
        </label>
        {value && (
          <span className="text-xs text-success">✓ Photo attached</span>
        )}
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-line py-12 text-center text-sm text-faint">
      {children}
    </div>
  );
}

function ManagerStyles() {
  return (
    <style>{`
      .m-input {
        width: 100%;
        border-radius: 0.75rem;
        border: 1px solid var(--color-line);
        background: var(--color-surface-2);
        padding: 0.55rem 0.8rem;
        font-size: 0.875rem;
        color: var(--color-fg);
        outline: none;
      }
      .m-input:focus {
        border-color: rgba(243, 198, 19, 0.6);
        box-shadow: 0 0 0 3px rgba(243, 198, 19, 0.12);
      }
      .m-input::placeholder { color: var(--color-faint); }
      .lbl {
        display: block;
        margin-bottom: 0.375rem;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-faint);
      }
      .btn-gold {
        display: inline-flex;
        height: 2.6rem;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 0 1.25rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-ink);
        background: linear-gradient(to bottom, var(--color-gold-bright), var(--color-gold));
        white-space: nowrap;
      }
      .btn-outline {
        display: inline-flex;
        height: 2.6rem;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        border: 1px solid var(--color-line-strong);
        padding: 0 1.1rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-fg);
        white-space: nowrap;
      }
    `}</style>
  );
}
