"use client";

import { useState } from "react";
import Link from "next/link";
import { OFFICIAL_DIVISIONS, teamRankings, type DivisionGroup } from "@/lib/data";
import { PosterUpload } from "./poster-upload";
import { createCompetitionAction } from "./actions";

const REGIONS = ["NCR", "Luzon", "Visayas", "Mindanao"];
const BASE_LEVELS = ["Local", "Regional", "National"] as const;
const GROUPS: DivisionGroup[] = ["Regular", "Junior", "Open"];

export function CompetitionForm() {
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [mapLink, setMapLink] = useState("");

  const [level, setLevel] = useState<string>("Regional");
  const [customLevel, setCustomLevel] = useState("");
  const isCustomLevel = level === "__custom";

  const [showNonMember, setShowNonMember] = useState(false);
  const [rankingCounts, setRankingCounts] = useState(true);
  const [orgTeam, setOrgTeam] = useState("");
  const [orgTeamCustom, setOrgTeamCustom] = useState("");
  const [allowTeamMembers, setAllowTeamMembers] = useState(true);
  const [allowJudges, setAllowJudges] = useState(false);
  const [liveUrl, setLiveUrl] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);

  function openMapsSearch() {
    const q = `${venue} ${city}`.trim() || "betta competition venue";
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form action={createCompetitionAction} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <PosterUpload />
      </div>

      <div className="sm:col-span-2">
        <Field label="Competition name">
          <input
            name="name"
            required
            className="n-input"
            placeholder="e.g. Bicol Regional Open 2026"
          />
        </Field>
      </div>

      {/* Organizing team — recorded as the show's organizer */}
      <div className="sm:col-span-2">
        <Field label="Organized by (team / club)">
          <select
            name="organizer"
            value={orgTeam}
            onChange={(e) => setOrgTeam(e.target.value)}
            className="n-input"
          >
            <option value="">Select organizing team…</option>
            {teamRankings.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
            <option value="__other">Other organizer…</option>
          </select>
        </Field>
        {orgTeam === "__other" && (
          <input
            name="organizerCustom"
            value={orgTeamCustom}
            onChange={(e) => setOrgTeamCustom(e.target.value)}
            className="n-input mt-2"
            placeholder="Enter organizer name"
          />
        )}
        <p className="mt-1.5 text-xs text-faint">
          {orgTeam && orgTeam !== "__other"
            ? `“${orgTeam}” will be recorded as this show’s organizer and shown on its public page.`
            : "The chosen team is recorded as the show’s organizer and shown on its public page."}
        </p>
      </div>

      {/* Venue + Google Maps pin */}
      <Field label="Venue">
        <input
          name="venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className="n-input"
          placeholder="e.g. SM City Naga"
        />
      </Field>
      <Field label="City">
        <input
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="n-input"
          placeholder="e.g. Naga City"
        />
      </Field>

      <div className="sm:col-span-2">
        <span className="lbl">📍 Pin location on Google Maps</span>
        <div className="flex flex-wrap gap-2">
          <input
            value={mapLink}
            onChange={(e) => setMapLink(e.target.value)}
            className="n-input flex-1 sm:min-w-[260px]"
            placeholder="Paste Google Maps link or Plus Code"
          />
          <button type="button" onClick={openMapsSearch} className="btn-line">
            🔎 Find on Maps
          </button>
          {mapLink.trim() && (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold-sm"
            >
              Open pin ↗
            </a>
          )}
        </div>
        <p className="mt-1.5 text-xs text-faint">
          Search the venue, copy its share link, and paste it here — competitors
          can then navigate to the event in one tap.
        </p>
      </div>

      {/* Live stream link */}
      <div className="sm:col-span-2">
        <Field label="Live stream link (optional)">
          <input
            name="liveUrl"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            className="n-input"
            placeholder="Facebook Live / YouTube URL — e.g. https://facebook.com/yourpage/live"
          />
        </Field>
        <p className="mt-1.5 text-xs text-faint">
          Viewers get a <span className="text-fg">🔴 Watch Live</span> button on
          the public show page that opens this link. You can also add or change it
          anytime from the show console once you go live.
        </p>
      </div>

      <Field label="Region">
        <select name="region" className="n-input">
          {REGIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </Field>

      {/* Competition level (or custom) */}
      <Field label="Competition level">
        <select
          name="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="n-input"
        >
          {BASE_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
          <option value="__custom">Custom level…</option>
        </select>
      </Field>
      {isCustomLevel && (
        <Field label="Custom level name">
          <input
            name="levelCustom"
            value={customLevel}
            onChange={(e) => setCustomLevel(e.target.value)}
            className="n-input"
            placeholder="e.g. Grand Championship"
          />
        </Field>
      )}
      {!isCustomLevel && (
        <div className="hidden sm:block" aria-hidden />
      )}

      {/* Dates */}
      <Field label="Event date">
        <input type="date" name="date" required className="n-input" />
      </Field>
      <Field label="Judging date">
        <input type="date" className="n-input" />
      </Field>
      <Field label="Bench-in date">
        <input type="date" className="n-input" />
      </Field>
      <Field label="Bench-in cutoff time">
        <input type="time" className="n-input" />
      </Field>
      <Field label="Bench-out date">
        <input type="date" className="n-input" />
      </Field>
      <Field label="Registration deadline">
        <input type="date" name="registrationDeadline" className="n-input" />
      </Field>
      <Field label="Maximum entries">
        <input
          type="number"
          name="maxEntries"
          className="n-input"
          placeholder="500"
        />
      </Field>

      {/* Entry fees */}
      <Field label="Entry fee — Member (₱ / fish)">
        <input
          type="number"
          name="entryFee"
          className="n-input"
          placeholder="200"
        />
      </Field>
      {!showNonMember ? (
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setShowNonMember(true)}
            className="btn-line"
          >
            + Add Non-member fee
          </button>
        </div>
      ) : (
        <Field label="Entry fee — Non-member (₱ / fish)">
          <div className="flex gap-2">
            <input
              type="number"
              className="n-input flex-1"
              placeholder="250"
            />
            <button
              type="button"
              onClick={() => setShowNonMember(false)}
              className="flex w-11 items-center justify-center rounded-xl border border-line-strong text-faint hover:text-danger"
              aria-label="Remove non-member fee"
            >
              ✕
            </button>
          </div>
        </Field>
      )}

      {/* Divisions offered (official list) */}
      <div className="sm:col-span-2">
        <span className="lbl">Divisions offered</span>
        <div className="space-y-4 rounded-2xl border border-line bg-surface-2/50 p-4">
          {GROUPS.map((g) => (
            <div key={g}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                {g}
              </p>
              <div className="flex flex-wrap gap-2">
                {OFFICIAL_DIVISIONS.filter((d) => d.group === g).map((d) => (
                  <label
                    key={d.name}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-sm text-muted has-[:checked]:border-gold/60 has-[:checked]:bg-gold/10 has-[:checked]:text-gold"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={g === "Regular"}
                      className="accent-gold"
                    />
                    {d.name}
                    {d.abbr ? ` (${d.abbr})` : ""}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-faint">
          The official division list is pre-selected. You can fine-tune classes
          per division inside the show console after creating the event.
        </p>
      </div>

      {/* National ranking declaration */}
      <div className="sm:col-span-2">
        <span className="lbl">National ranking</span>
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
            rankingCounts
              ? "border-gold/50 bg-gold/[0.06]"
              : "border-line bg-surface-2/50"
          }`}
        >
          <input
            type="checkbox"
            name="rankingCounts"
            checked={rankingCounts}
            onChange={(e) => setRankingCounts(e.target.checked)}
            className="mt-0.5 size-4 accent-gold"
          />
          <span>
            <span className="font-semibold text-fg">
              Include this show in the National Ranking
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              {rankingCounts
                ? "Placements & awards from this show will count toward national player, breeder, and team standings."
                : "This show runs as an exhibition — results won't affect national standings."}
            </span>
          </span>
        </label>
      </div>

      {/* Participation policy — set by the organizing team */}
      <div className="sm:col-span-2">
        <span className="lbl">Participation policy</span>
        <div className="space-y-3">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
              allowTeamMembers
                ? "border-gold/50 bg-gold/[0.06]"
                : "border-line bg-surface-2/50"
            }`}
          >
            <input
              type="checkbox"
              name="allowTeamMembers"
              checked={allowTeamMembers}
              onChange={(e) => setAllowTeamMembers(e.target.checked)}
              className="mt-0.5 size-4 accent-gold"
            />
            <span>
              <span className="font-semibold text-fg">
                Allow the organizing team&apos;s members to compete
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                {allowTeamMembers
                  ? "Members of the organizing team may enter their fish in this show."
                  : "Members of the organizing team are barred from entering — avoids any home-team advantage."}
              </span>
            </span>
          </label>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
              allowJudges
                ? "border-gold/50 bg-gold/[0.06]"
                : "border-line bg-surface-2/50"
            }`}
          >
            <input
              type="checkbox"
              name="allowJudges"
              checked={allowJudges}
              onChange={(e) => setAllowJudges(e.target.checked)}
              className="mt-0.5 size-4 accent-gold"
            />
            <span>
              <span className="font-semibold text-fg">
                Allow official judges to compete
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                {allowJudges
                  ? "Judges officiating this show may also enter fish — disclose this to entrants."
                  : "Official judges cannot enter fish — the default, to keep judging fair."}
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Organizer Terms of Agreement */}
      <div className="sm:col-span-2">
        <span className="lbl">Organizer agreement</span>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface-2/50 p-4">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="mt-0.5 size-4 accent-gold"
          />
          <span className="text-sm text-muted">
            On behalf of the organizing team, I have read and agree to the{" "}
            <Link
              href="/terms/organizer"
              target="_blank"
              className="font-semibold text-gold underline-offset-2 hover:underline"
            >
              FINOY Organizer Terms of Agreement
            </Link>{" "}
            — including the 5% platform fee and FINOY&apos;s right to hold
            settlements and standings as security against the organizing
            team&apos;s obligations.
          </span>
        </label>
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={!agreedTerms}
          title={
            agreedTerms ? undefined : "Accept the Organizer Terms of Agreement first"
          }
          className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:from-surface-2 disabled:to-surface-2 disabled:text-faint disabled:hover:translate-y-0"
        >
          Submit for approval
        </button>
        {!agreedTerms && (
          <p className="mt-1.5 text-xs text-faint">
            You must accept the Organizer Terms of Agreement to submit.
          </p>
        )}
      </div>

      <style>{`
        .n-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-line);
          background: var(--color-surface-2);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--color-fg);
          outline: none;
        }
        .n-input:focus {
          border-color: rgba(243, 198, 19, 0.6);
          box-shadow: 0 0 0 3px rgba(243, 198, 19, 0.12);
        }
        .n-input::placeholder { color: var(--color-faint); }
        .lbl {
          display: block;
          margin-bottom: 0.375rem;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-faint);
        }
        .btn-line {
          display: inline-flex; height: 2.6rem; align-items: center;
          justify-content: center; border-radius: 999px;
          border: 1px solid var(--color-line-strong); padding: 0 1.1rem;
          font-size: 0.875rem; font-weight: 600; color: var(--color-fg);
          white-space: nowrap;
        }
        .btn-gold-sm {
          display: inline-flex; height: 2.6rem; align-items: center;
          justify-content: center; border-radius: 999px; padding: 0 1.1rem;
          font-size: 0.875rem; font-weight: 600; color: var(--color-ink);
          background: linear-gradient(to bottom, var(--color-gold-bright), var(--color-gold));
          white-space: nowrap;
        }
      `}</style>
    </form>
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
