"use client";

export interface AwardRow {
  type: string;
  award: string;
  code: string;
  owner: string;
  points: number;
}
export interface RankRow {
  rank: number;
  player: string;
  points: number;
}

/**
 * Downloads the show's official results as a CSV (opens directly in Excel /
 * Google Sheets) — player ranking by points, plus every award winner and the
 * points it carries. Available once a show is closed.
 */
export function DownloadResults({
  showName,
  awardRows,
  rankingRows,
}: {
  showName: string;
  awardRows: AwardRow[];
  rankingRows: RankRow[];
}) {
  function download() {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const row = (cells: (string | number)[]) => cells.map(esc).join(",");

    const lines: string[] = [];
    lines.push(esc(`${showName} — Official Results`));
    lines.push("");
    lines.push("PLAYER RANKING");
    lines.push(row(["Rank", "Player", "Points"]));
    for (const r of rankingRows) lines.push(row([r.rank, r.player, r.points]));
    lines.push("");
    lines.push("AWARD WINNERS");
    lines.push(row(["Type", "Award", "Code", "Owner", "Points"]));
    for (const a of awardRows)
      lines.push(row([a.type, a.award, a.code, a.owner, a.points]));

    // BOM so Excel reads UTF-8 correctly; CRLF line endings for Excel.
    const csv = "﻿" + lines.join("\r\n");
    const slug =
      showName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "show";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug}-results.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-bright to-gold px-5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
    >
      ⬇ Download results (Excel)
    </button>
  );
}
