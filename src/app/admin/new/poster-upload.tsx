"use client";

import { useState } from "react";

/**
 * Portrait poster upload for a new competition. Shows a live 3:4 preview so the
 * organizer sees exactly how it will appear as a featured poster card on the
 * public competitions page.
 */
export function PosterUpload() {
  const [img, setImg] = useState<string>();

  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-faint">
        Portrait poster — featured on the competitions page
      </span>
      <div className="flex flex-wrap items-start gap-5">
        <label className="group relative flex aspect-[3/4] w-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line-strong bg-surface-2 text-center text-xs text-faint transition-colors hover:border-gold/50">
          {img ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt="poster preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-1.5 text-[10px] font-semibold text-gold opacity-0 transition-opacity group-hover:opacity-100">
                Change photo
              </span>
            </>
          ) : (
            <span className="px-3">
              <span className="block text-2xl">＋</span>
              Upload portrait
              <span className="mt-1 block text-[10px]">3 : 4</span>
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImg(URL.createObjectURL(file));
            }}
          />
        </label>

        <div className="max-w-xs text-sm text-muted">
          <p className="font-medium text-fg">Make it pop.</p>
          <p className="mt-1 text-xs leading-5">
            Upload a striking 3:4 portrait poster (JPG or PNG). It headlines the{" "}
            <span className="text-gold">Featured Competitions</span> marquee and
            your event&apos;s page. No image? We&apos;ll generate a premium
            branded poster automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
