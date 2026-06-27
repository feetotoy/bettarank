"use client";

import { useRef, useState } from "react";

/**
 * Player portrait with self-service upload. In this mock the picture is held in
 * local state (read as a data URL) — swap for a real upload + persist call when
 * the backend exists. Falls back to the player's initials when no photo is set.
 */
export function ProfileAvatar({
  name,
  initialPhoto,
}: {
  name: string;
  initialPhoto?: string;
}) {
  const [photo, setPhoto] = useState<string | undefined>(initialPhoto);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setPhoto(typeof reader.result === "string" ? reader.result : undefined);
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative size-16 shrink-0 sm:size-20">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative block size-full overflow-hidden rounded-2xl border border-gold/30 bg-gold/10"
        aria-label="Upload your photo"
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={name} className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center font-display text-xl font-bold text-gold sm:text-2xl">
            {initials}
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-ink/75 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gold opacity-0 transition-opacity group-hover:opacity-100">
          📷 Edit
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}
