"use client";

import { useState } from "react";
import Link from "next/link";
import { playerNotifications, type PlayerNotification } from "@/lib/data";

const TONE_ACCENT: Record<PlayerNotification["tone"], string> = {
  win: "border-l-gold",
  lose: "border-l-danger",
  info: "border-l-blue",
};
const CODE_TONE: Record<PlayerNotification["tone"], string> = {
  win: "border-gold/40 bg-gold/10 text-gold",
  lose: "border-danger/40 bg-danger/10 text-danger",
  info: "border-blue/40 bg-blue/10 text-blue-bright",
};

/**
 * Notification bell for the signed-in player/handler — playful live updates on
 * their fish entries (placements, OUT, reclass, advancing to higher judging).
 */
export function Notifications() {
  const [open, setOpen] = useState(false);
  const items = playerNotifications;
  const count = items.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex size-9 items-center justify-center rounded-full border border-line text-base text-fg transition-colors hover:border-gold/50"
      >
        🔔
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[92vw] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-display text-sm font-bold text-fg">
                Your fish updates 🐟
              </span>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold">
                {count} new
              </span>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {items.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 border-b border-l-2 border-line/50 px-4 py-3 last:border-b-0 ${TONE_ACCENT[n.tone]}`}
                >
                  <span className="mt-0.5 text-xl">{n.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-fg">{n.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">
                      {n.message}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${CODE_TONE[n.tone]}`}
                      >
                        {n.code}
                      </span>
                      <span className="text-[10px] text-faint">{n.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/track"
              onClick={() => setOpen(false)}
              className="block border-t border-line px-4 py-2.5 text-center text-xs font-semibold text-gold hover:bg-surface-2"
            >
              Track all my fish →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
