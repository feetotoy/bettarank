"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAuthConfigured } from "@/lib/supabase/config";
import { deleteCookie } from "@/lib/cookies";

export function AccountActions({ demo }: { demo: boolean }) {
  const router = useRouter();

  async function logout() {
    if (isAuthConfigured()) await createClient().auth.signOut();
    else deleteCookie("finoy-role");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-3">
      {demo && (
        <Link
          href="/login"
          className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-fg transition-colors hover:border-gold/50"
        >
          ↔ Switch role
        </Link>
      )}
      <button
        type="button"
        onClick={logout}
        className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-fg transition-colors hover:border-danger/50 hover:text-danger"
      >
        Log out
      </button>
    </div>
  );
}
