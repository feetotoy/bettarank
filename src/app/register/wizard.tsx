"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { QrCode } from "@/components/qr-code";
import type { Competition } from "@/lib/data";
import {
  peso,
  OFFICIAL_DIVISIONS,
  teamRankings,
  registeredHandlers,
  breederRankings,
  divisionClasses,
  isOfficialJudge,
  currentHandler,
  tankPad,
} from "@/lib/data";

// Mock signed-in player. When logged in, the form auto-fills name + team.
const CURRENT_PLAYER: { loggedIn: boolean; name: string; team: string } = {
  loggedIn: true,
  name: "Martin Ozaeta",
  team: "Dauntless",
};
const NO_TEAM = "__none";
const ADD_TEAM = "__add";
const NO_HANDLER = "__none";
const ADD_HANDLER = "__add";
const NO_BREEDER = "__none";
const ADD_BREEDER = "__add";

const STEPS = [
  "Competition",
  "Confirm Player",
  "Class Entries",
  "Review & Pay",
  "Confirmation",
] as const;

const PAYMENTS = ["GCash", "Maya", "Bank Transfer"];
const PAY_DETAILS: Record<string, { number: string; name: string }> = {
  GCash: { number: "0917 123 4567", name: "FINOY Show" },
  Maya: { number: "0918 765 4321", name: "FINOY Show" },
  "Bank Transfer": { number: "BPI 1234 5678 90", name: "FINOY Show" },
};
const FB_CONFIRM = "fb.com/FinoyShow";
const HOLD_SECONDS = 3600; // unpaid slots are released after 1 hour

interface ClassEntry {
  id: string;
  division: string;
  classCode: string;
  className: string;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function RegistrationWizard({
  competitions,
}: {
  competitions: Competition[];
}) {
  const [step, setStep] = useState(0);
  const [compSlug, setCompSlug] = useState(competitions[0]?.slug ?? "");

  const [entries, setEntries] = useState<ClassEntry[]>([]);
  const [division, setDivision] = useState(OFFICIAL_DIVISIONS[0]?.name ?? "");
  const [classCode, setClassCode] = useState(
    divisionClasses(OFFICIAL_DIVISIONS[0]?.name ?? "")[0]?.code ?? "",
  );
  // Whether the signed-in player is an official judge. Judges can't enter a fish
  // unless the show's organizing team explicitly allows judges to compete.
  const isJudge =
    CURRENT_PLAYER.loggedIn && isOfficialJudge(CURRENT_PLAYER.name);

  // Auto-filled from the signed-in account when logged in.
  const [playerName, setPlayerName] = useState(
    CURRENT_PLAYER.loggedIn ? CURRENT_PLAYER.name : "",
  );
  const teamIsRegistered =
    CURRENT_PLAYER.loggedIn &&
    teamRankings.some((t) => t.name === CURRENT_PLAYER.team);
  const [teamSelect, setTeamSelect] = useState(
    teamIsRegistered ? CURRENT_PLAYER.team : NO_TEAM,
  );
  const [teamCustom, setTeamCustom] = useState("");
  const [handlerSelect, setHandlerSelect] = useState(NO_HANDLER);
  const [handlerCustom, setHandlerCustom] = useState("");
  const [breederSelect, setBreederSelect] = useState(NO_BREEDER);
  const [breederCustom, setBreederCustom] = useState("");
  const [payment, setPayment] = useState(PAYMENTS[0]);
  const [proof, setProof] = useState<string>();
  // Player must agree that only organizers can change a fish's division/class.
  const [agreedClassPolicy, setAgreedClassPolicy] = useState(false);
  // A handler can register on a player's behalf, entering the player's name.
  const [registrantType, setRegistrantType] = useState<"player" | "handler">(
    "player",
  );

  const team =
    teamSelect === ADD_TEAM
      ? teamCustom.trim()
      : teamSelect === NO_TEAM
        ? ""
        : teamSelect;
  const handler =
    handlerSelect === ADD_HANDLER
      ? handlerCustom.trim()
      : handlerSelect === NO_HANDLER
        ? ""
        : handlerSelect;
  const breeder =
    breederSelect === ADD_BREEDER
      ? breederCustom.trim()
      : breederSelect === NO_BREEDER
        ? ""
        : breederSelect;

  // 1-hour hold on unpaid reservations.
  const [holdLeft, setHoldLeft] = useState<number | null>(null);
  const [released, setReleased] = useState(false);
  const [reserveNonce, setReserveNonce] = useState(0);
  const [paidCodes, setPaidCodes] = useState<string[] | null>(null);
  const idc = useRef(0);

  const comp = competitions.find((c) => c.slug === compSlug);
  const total = comp ? comp.entryFee * entries.length : 0;
  // A judge is blocked from THIS show unless its organizing team allows judges.
  const judgeBlocked = isJudge && !!comp && !comp.allowJudges;
  // Registration closes for everyone once the organizer starts judging.
  const registrationLocked = !!comp && !!comp.judgingStarted;

  // Tank numbers are a SINGLE show-wide sequence — no two entries share one,
  // regardless of class (A1-0001, A2-0002, A1-0003…). Unpaid tanks are released
  // and reused, so numbering stays dense from 1 to latest.
  const usedTanks = hashStr(compSlug + "tanks") % 8; // mock: slots already taken

  // The k-th entry the player adds (across all classes) gets the next tank.
  const reservedByEntry = useMemo(() => {
    const c = competitions.find((x) => x.slug === compSlug);
    const width = tankPad(c?.entries ?? 0);
    const base = hashStr(compSlug + "tanks") % 8;
    const map: Record<string, string> = {};
    entries.forEach((e, i) => {
      const tank = base + i + 1; // global, sequential, no gaps
      map[e.id] = `${e.classCode.toUpperCase()}-${String(tank).padStart(width, "0")}`;
    });
    return map;
  }, [entries, compSlug, competitions]);

  // Bench codes are assigned to held slots but only ISSUED to the player once
  // the organizer confirms payment — so they aren't shown during registration.
  const reservedCodes = entries.map((e) => reservedByEntry[e.id]);

  // Tick the hold countdown while the player is on Review & Pay (unpaid).
  useEffect(() => {
    if (step !== 3 || paidCodes) return;
    const t = setInterval(() => {
      setHoldLeft((s) => {
        if (s === null) return s;
        if (s <= 1) {
          clearInterval(t);
          setReleased(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step, paidCodes, reserveNonce]);

  function reReserve() {
    setReleased(false);
    setHoldLeft(HOLD_SECONDS);
    setReserveNonce((n) => n + 1);
  }

  function goNext() {
    if (!canNext) return;
    const next = step + 1;
    if (next === 3) {
      // Entering checkout reserves the codes and starts the 1-hour hold.
      setReleased(false);
      setHoldLeft(HOLD_SECONDS);
    }
    setStep(next);
  }

  function addEntry() {
    const code = classCode.trim().toUpperCase();
    if (!code) return;
    if (entries.some((e) => e.classCode.toUpperCase() === code && e.division === division))
      return;
    const className =
      divisionClasses(division).find((c) => c.code === code)?.name ?? "";
    setEntries((p) => [
      ...p,
      { id: `e-${(idc.current += 1)}`, division, classCode: code, className },
    ]);
  }
  function removeEntry(id: string) {
    setEntries((p) => p.filter((e) => e.id !== id));
  }

  // Submitting payment does NOT issue codes — they're held pending the
  // organizer's confirmation of payment.
  function pay() {
    setHoldLeft(null);
    setReleased(false);
    setStep(4);
  }
  // Codes are issued only when the organizer confirms the payment; the player is
  // then notified of the code(s). (Demo stand-in for the backend event.)
  function confirmByOrganizer() {
    setPaidCodes(reservedCodes);
  }
  function resetWizard() {
    setStep(0);
    setEntries([]);
    setPaidCodes(null);
    setProof(undefined);
    setAgreedClassPolicy(false);
  }

  // Switch between registering as the player vs. a handler acting for a player.
  function switchRegistrant(type: "player" | "handler") {
    setRegistrantType(type);
    if (type === "handler") {
      setPlayerName(""); // handler types the player (owner) name
      setHandlerSelect(currentHandler.name); // registrant is this handler
    } else {
      setPlayerName(CURRENT_PLAYER.loggedIn ? CURRENT_PLAYER.name : "");
      setHandlerSelect(NO_HANDLER);
    }
  }

  const canNext =
    (step === 0 && !!compSlug && !judgeBlocked && !registrationLocked) ||
    (step === 1 && playerName.trim().length > 1) ||
    (step === 2 && entries.length > 0 && agreedClassPolicy) ||
    (step === 3 && !released);

  return (
    <div>
      {/* Progress stepper */}
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors ${
                    active
                      ? "border-gold bg-gold text-ink"
                      : done
                        ? "border-gold/50 bg-gold/15 text-gold"
                        : "border-line bg-surface-2 text-faint"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={`hidden text-sm font-medium sm:block ${
                    active ? "text-fg" : "text-faint"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 ${done ? "bg-gold/50" : "bg-line"}`} />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 rounded-2xl border border-line bg-surface/60 p-6 sm:p-8">
        {/* STEP 0 — competition */}
        {step === 0 && (
          <Section
            title="Choose an event"
            hint="Pick the competition you want to enter your fish in."
          >
            <div className="grid gap-3">
              {competitions.map((c) => (
                <label
                  key={c.slug}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
                    compSlug === c.slug
                      ? "border-gold/60 bg-gold/[0.06]"
                      : "border-line hover:border-line-strong"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="comp"
                      checked={compSlug === c.slug}
                      onChange={() => setCompSlug(c.slug)}
                      className="accent-gold"
                    />
                    <div>
                      <div className="font-semibold text-fg">{c.name}</div>
                      <div className="text-xs text-muted">
                        {c.city} · {c.level}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 font-display font-bold text-gold">
                    {peso(c.entryFee)} / class
                  </span>
                </label>
              ))}
            </div>

            {judgeBlocked && (
              <div className="mt-4 rounded-xl border border-danger/40 bg-danger/[0.06] px-4 py-3 text-sm">
                <p className="font-semibold text-danger">
                  ⚖️ Judges can&apos;t compete in this show
                </p>
                <p className="mt-0.5 text-danger/90">
                  You&apos;re an official judge, and{" "}
                  {comp?.name ?? "this show"}&apos;s organizing team hasn&apos;t
                  allowed judges to enter. Pick a show that allows judges, or
                  contact the organizer.
                </p>
              </div>
            )}

            {registrationLocked && (
              <div className="mt-4 rounded-xl border border-danger/40 bg-danger/[0.06] px-4 py-3 text-sm">
                <p className="font-semibold text-danger">
                  🔒 Registration closed — judging has started
                </p>
                <p className="mt-0.5 text-danger/90">
                  {comp?.name ?? "This show"} is now in judging, so new entries are
                  locked. From here, only organizers can change a fish&apos;s
                  division or class.
                </p>
              </div>
            )}
          </Section>
        )}

        {/* STEP 2 — class entries */}
        {step === 2 && (
          <Section
            title="Add class entries"
            hint="Enter one or more classes (e.g. A1). Tank numbers are unique across the whole show — A1-0001, A2-0002, … — so two entries never share a tank number."
          >
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex-1 sm:min-w-[200px]">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-faint">
                  Division
                </span>
                <select
                  value={division}
                  onChange={(e) => {
                    const name = e.target.value;
                    setDivision(name);
                    // Reset the class to the first one the organizer offers here.
                    setClassCode(divisionClasses(name)[0]?.code ?? "");
                  }}
                  className="w-input"
                >
                  {OFFICIAL_DIVISIONS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                      {d.abbr ? ` (${d.abbr})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex-1 sm:min-w-[200px]">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-faint">
                  Class
                </span>
                <select
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-input"
                >
                  {divisionClasses(division).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={addEntry}
                className="inline-flex h-[42px] items-center rounded-xl border border-line-strong px-4 text-sm font-semibold text-fg"
              >
                + Add
              </button>
            </div>

            {/* Slot availability — the bench code itself is issued on confirmation */}
            {entries.length > 0 && (
              <p className="mt-2 text-xs text-muted">
                {usedTanks + entries.length} slot
                {usedTanks + entries.length === 1 ? "" : "s"} reserved in this
                show. Your bench code is issued once the organizer confirms your
                payment.
              </p>
            )}

            {entries.length > 0 ? (
              <div className="mt-5 space-y-2">
                {entries.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-2.5"
                  >
                    <span className="inline-flex min-w-14 justify-center rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-sm font-bold text-gold">
                      {e.classCode}
                    </span>
                    <span className="flex-1 truncate text-sm text-muted">
                      {e.className ? `${e.className} · ` : ""}
                      {e.division}
                    </span>
                    <span className="text-xs text-faint">{peso(comp?.entryFee ?? 0)}</span>
                    <button
                      type="button"
                      onClick={() => removeEntry(e.id)}
                      className="text-faint hover:text-danger"
                      aria-label="Remove class entry"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <p className="pt-1 text-sm text-muted">
                  {entries.length} class{entries.length === 1 ? "" : "es"} ·{" "}
                  <span className="font-semibold text-gold">{peso(total)}</span>{" "}
                  total
                </p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-faint">
                No class entries yet — add at least one above.
              </p>
            )}

            {/* Note + required agreement: only organizers change class/division */}
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-line bg-surface-2/60 p-3 text-xs text-muted">
              <span>📝</span>
              <p>
                Choose your division &amp; class carefully. After you register,{" "}
                <span className="text-fg">
                  only the organizers can change a fish&apos;s division or class
                </span>{" "}
                (e.g. a reclass during judging) — players can&apos;t edit it
                themselves.
              </p>
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2/60 p-3 text-sm">
              <input
                type="checkbox"
                checked={agreedClassPolicy}
                onChange={(e) => setAgreedClassPolicy(e.target.checked)}
                className="mt-0.5 size-4 accent-gold"
              />
              <span className="text-muted">
                I understand and agree that{" "}
                <span className="text-fg">
                  changes to division and class can only be made by the
                  organizers
                </span>
                .
              </span>
            </label>
            {entries.length > 0 && !agreedClassPolicy && (
              <p className="mt-1.5 text-xs text-faint">
                Tick the agreement above to continue.
              </p>
            )}
          </Section>
        )}

        {/* STEP 1 — confirm player */}
        {step === 1 && (
          <Section
            title="Confirm player"
            hint="Register as the player, or as a handler entering on a player's behalf. Pick the team and handler, or add them if they're not listed."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Who is registering? Player or handler-for-a-player */}
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-faint">
                  Registering as
                </span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { key: "player", label: "Myself (player)" },
                      { key: "handler", label: "Handler — for a player" },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => switchRegistrant(o.key)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        registrantType === o.key
                          ? "border-gold/60 bg-gold/10 text-gold"
                          : "border-line text-muted hover:border-line-strong hover:text-fg"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {registrantType === "handler" && (
                  <p className="mt-2 flex items-start gap-2 text-xs text-muted">
                    <span>🤝</span>
                    <span>
                      You&apos;re registering as handler{" "}
                      <span className="font-semibold text-fg">
                        “{currentHandler.alias}”
                      </span>{" "}
                      on behalf of a player. Enter the player who owns the fish —
                      they&apos;ll be the registered owner of these entries.
                    </span>
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Field
                  label={
                    registrantType === "handler"
                      ? "Player name (fish owner)"
                      : "Player name"
                  }
                >
                  <input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-input"
                    placeholder={
                      registrantType === "handler"
                        ? "Enter the player's name"
                        : "e.g. Juan Dela Cruz"
                    }
                  />
                </Field>
                {registrantType === "player" && CURRENT_PLAYER.loggedIn && (
                  <p className="mt-1.5 text-xs text-success">
                    ✓ Auto-filled from your FINOY account.
                  </p>
                )}
              </div>

              {/* Team — registered teams + No team / Add team */}
              <div>
                <Field label="Team">
                  <select
                    value={teamSelect}
                    onChange={(e) => setTeamSelect(e.target.value)}
                    className="w-input"
                  >
                    {teamRankings.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                    <option value={NO_TEAM}>No team</option>
                    <option value={ADD_TEAM}>Add team…</option>
                  </select>
                </Field>
                {teamSelect === ADD_TEAM && (
                  <input
                    value={teamCustom}
                    onChange={(e) => setTeamCustom(e.target.value)}
                    className="w-input mt-2"
                    placeholder="Enter team name"
                  />
                )}
              </div>

              {/* Handler — registered handlers + No handler / Add handler */}
              <div>
                <Field label="Handler">
                  <select
                    value={handlerSelect}
                    onChange={(e) => setHandlerSelect(e.target.value)}
                    className="w-input"
                  >
                    <option value={NO_HANDLER}>No handler</option>
                    {registeredHandlers.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name} — “{h.alias}”
                      </option>
                    ))}
                    <option value={ADD_HANDLER}>Add handler name…</option>
                  </select>
                </Field>
                {handlerSelect === ADD_HANDLER && (
                  <input
                    value={handlerCustom}
                    onChange={(e) => setHandlerCustom(e.target.value)}
                    className="w-input mt-2"
                    placeholder="Enter handler name"
                  />
                )}
              </div>

              {/* Breeder — verified/registered breeders + No breeder / Add breeder */}
              <div className="sm:col-span-2">
                <Field label="Breeder">
                  <select
                    value={breederSelect}
                    onChange={(e) => setBreederSelect(e.target.value)}
                    className="w-input"
                  >
                    <option value={NO_BREEDER}>No breeder</option>
                    {breederRankings.map((b) => (
                      <option key={b.id} value={b.farm}>
                        {b.farm} — {b.name}
                      </option>
                    ))}
                    <option value={ADD_BREEDER}>Add breeder…</option>
                  </select>
                </Field>
                {breederSelect === ADD_BREEDER && (
                  <input
                    value={breederCustom}
                    onChange={(e) => setBreederCustom(e.target.value)}
                    className="w-input mt-2"
                    placeholder="Enter breeder name"
                  />
                )}
              </div>
            </div>
          </Section>
        )}

        {/* STEP 3 — review & pay */}
        {step === 3 && (
          <Section
            title="Review & payment"
            hint="Your entries are held while you pay. Bench codes are issued once the organizer confirms your payment."
          >
            {/* Hold banner */}
            <div
              className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${
                released
                  ? "border-danger/50 bg-danger/10"
                  : "border-gold/40 bg-gold/[0.06]"
              }`}
            >
              {released ? (
                <span className="text-sm font-semibold text-danger">
                  ⓘ Time&apos;s up — your unpaid entries were released and are
                  available to others again.
                </span>
              ) : (
                <span className="text-sm text-muted">
                  ⏳ Entries held — pay within{" "}
                  <span className="font-mono font-bold text-gold">
                    {formatHold(holdLeft ?? HOLD_SECONDS)}
                  </span>{" "}
                  or they&apos;ll be released.
                </span>
              )}
              {released && (
                <button
                  type="button"
                  onClick={reReserve}
                  className="rounded-full border border-line-strong px-3 py-1 text-xs font-semibold text-fg"
                >
                  Re-hold entries
                </button>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-line bg-surface-2 p-5 text-sm">
                <Row label="Player" value={playerName || "—"} />
                {team.trim() && <Row label="Team" value={team} />}
                {handler.trim() && <Row label="Handler" value={handler} />}
                {breeder.trim() && <Row label="Breeder" value={breeder} />}
                <Row label="Event" value={comp?.name ?? "—"} />
                <div>
                  <div className="mb-1.5 text-faint">
                    Entries ({entries.length})
                  </div>
                  <div className="space-y-1">
                    {entries.map((e) => (
                      <div key={e.id} className="text-xs">
                        <span className="font-mono font-semibold text-gold">
                          {e.classCode}
                        </span>{" "}
                        {e.className ? (
                          <span className="text-fg">· {e.className} </span>
                        ) : null}
                        <span className="text-faint">· {e.division}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-faint">
                    🔒 Bench code(s) issued once the organizer confirms your
                    payment.
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span className="font-semibold text-fg">Total due</span>
                  <span className="font-display text-lg font-bold text-gold">
                    {peso(total)}
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
                  Payment method
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {PAYMENTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPayment(p)}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                        payment === p
                          ? "border-gold/60 bg-gold/10 text-gold"
                          : "border-line text-muted hover:border-line-strong hover:text-fg"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-faint">
                  Pay via {payment}, then upload your screenshot below so the
                  organizer can confirm and release your codes.
                </p>
              </div>
            </div>

            {/* Pay to (prominent) + scan-to-pay QR + upload proof */}
            <div className="mt-5 rounded-2xl border border-gold/40 bg-gold/[0.05] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                    Pay to · {payment}
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-gold sm:text-3xl">
                    {PAY_DETAILS[payment].number}
                  </p>
                  <p className="text-sm font-semibold text-fg">
                    {PAY_DETAILS[payment].name}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Amount{" "}
                    <span className="font-semibold text-fg">{peso(total)}</span> ·
                    send proof to{" "}
                    <span className="font-semibold text-fg">{FB_CONFIRM}</span>.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-center">
                  <div className="rounded-xl border border-line bg-white p-2">
                    <QrCode
                      value={`${payment}|${PAY_DETAILS[payment].number}|${PAY_DETAILS[payment].name}|${peso(total)}`}
                      size={116}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] font-semibold text-muted">
                    📷 Scan to pay
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gold/20 pt-4">
                <label className="flex h-24 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line-strong bg-surface text-center text-xs text-faint transition-colors hover:border-gold/50">
                  {proof ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={proof}
                      alt="payment screenshot"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="px-2">＋ Upload screenshot</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setProof(URL.createObjectURL(file));
                    }}
                  />
                </label>
                <p className="max-w-xs text-xs text-muted">
                  {proof
                    ? "✓ Screenshot attached. Submit to send it for the organizer's confirmation."
                    : "After paying, upload a screenshot of your transaction. The organizer reviews it and confirms your payment."}
                </p>
              </div>
            </div>
          </Section>
        )}

        {/* STEP 4 — confirmation (pending → issued on organizer confirmation) */}
        {step === 4 && !paidCodes && (
          <div className="py-4 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-3xl">
              ⏳
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold">
              Payment submitted — awaiting confirmation
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted">
              {playerName || "You"} submitted payment for {entries.length} entr
              {entries.length === 1 ? "y" : "ies"} in{" "}
              <span className="text-fg">{comp?.name}</span>. Your bench code
              {entries.length === 1 ? "" : "s"} will be issued once the organizer
              confirms your payment{proof ? " screenshot" : ""} — and you&apos;ll
              be notified.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-line bg-surface-2/60 p-5 text-sm">
              <span className="text-muted">Status: </span>
              <span className="font-semibold text-gold">
                Pending organizer confirmation
              </span>
            </div>

            <button
              type="button"
              onClick={confirmByOrganizer}
              className="mt-6 inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-sm font-semibold text-fg transition-colors hover:border-gold/50"
            >
              ✓ Simulate organizer confirmation (demo)
            </button>
            <div className="mt-4">
              <button
                type="button"
                onClick={resetWizard}
                className="text-sm font-semibold text-faint hover:text-fg"
              >
                Register more entries
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — codes issued after the organizer confirmed payment */}
        {step === 4 && paidCodes && (
          <div className="py-4 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-success/40 bg-success/10 text-3xl">
              🎉
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold">
              Payment confirmed — codes issued!
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted">
              The organizer confirmed your payment for{" "}
              <span className="text-fg">{comp?.name}</span>. Your bench code
              {paidCodes.length === 1 ? "" : "s"} below are now official.
            </p>

            {/* Player notification */}
            <div className="mx-auto mt-5 max-w-md rounded-xl border border-gold/40 bg-gold/[0.07] px-4 py-3 text-left text-sm">
              🔔{" "}
              <span className="font-semibold text-fg">
                Notification sent to {playerName || "you"}:
              </span>{" "}
              your code{paidCodes.length === 1 ? "" : "s"}{" "}
              <span className="font-mono text-gold">{paidCodes.join(", ")}</span>{" "}
              {paidCodes.length === 1 ? "has" : "have"} been issued.
            </div>

            <div className="mx-auto mt-5 max-w-md rounded-2xl border border-gold/30 bg-gold/[0.05] p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
                Your codes
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {paidCodes.map((c) => (
                  <span
                    key={c}
                    className="rounded-lg border border-gold bg-gold/15 px-3 py-1.5 font-mono text-base font-bold text-gold-bright"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={`/competitions/${comp?.slug ?? ""}`}
                className="inline-flex h-11 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 text-sm font-semibold text-ink"
              >
                View competition
              </Link>
              <button
                type="button"
                onClick={resetWizard}
                className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-sm font-semibold text-fg"
              >
                Register more entries
              </button>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        {step < 4 && (
          <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold text-muted transition-colors hover:text-fg disabled:opacity-0"
            >
              ← Back
            </button>
            {step === 3 ? (
              <button
                type="button"
                onClick={pay}
                disabled={released}
                className="inline-flex h-11 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-7 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                Pay {peso(total)} →
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!canNext}
                className="inline-flex h-11 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-7 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                Continue →
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        .w-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-line);
          background: var(--color-surface-2);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--color-fg);
          outline: none;
        }
        .w-input:focus {
          border-color: rgba(243, 198, 19, 0.6);
          box-shadow: 0 0 0 3px rgba(243, 198, 19, 0.12);
        }
        .w-input::placeholder { color: var(--color-faint); }
      `}</style>
    </div>
  );
}

function formatHold(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{hint}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-faint">
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-faint">{label}</dt>
      <dd className="text-right font-medium text-fg">{value}</dd>
    </div>
  );
}
