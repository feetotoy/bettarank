"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAuthConfigured } from "@/lib/supabase/config";
import { Card } from "@/components/ui";
import { BrandLogo } from "@/components/logo";

type Mode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const denied = params.get("denied");
  const configured = isAuthConfigured();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!configured) return;
    setLoading(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) return setError(error.message);
      router.push(next);
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) return setError(error.message);
      if (data.session) {
        router.push(next);
        router.refresh();
      } else {
        setInfo("Account created — check your email to confirm, then log in.");
        setMode("signin");
      }
    }
  }

  async function oauth(provider: "google" | "facebook") {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <Card className="w-full max-w-md p-8">
      <div className="flex flex-col items-center text-center">
        <BrandLogo className="h-12 w-auto" />
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "signin"
            ? "Log in to manage your fish, entries & rankings."
            : "Sign up to register fish and join competitions."}
        </p>
      </div>

      {!configured && (
        <div className="mt-6 rounded-xl border border-gold/40 bg-gold/[0.06] px-4 py-3 text-sm text-muted">
          Sign-in isn&apos;t enabled yet — Supabase Auth isn&apos;t configured on
          this deployment. You can still browse the demo.
          <Link href="/" className="mt-1 block font-semibold text-gold">
            Continue to site →
          </Link>
        </div>
      )}

      {denied && (
        <div className="mt-6 rounded-xl border border-danger/40 bg-danger/[0.06] px-4 py-3 text-sm text-danger">
          Your account doesn&apos;t have access to the{" "}
          {denied === "super-admin" ? "Super Admin" : "Organizer"} console. Sign
          in with an authorized account
          {denied === "super-admin"
            ? "."
            : " — or ask the Super Admin for organizer access."}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-faint">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="auth-input"
            disabled={!configured}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-faint">
            Password
          </span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input"
            disabled={!configured}
          />
        </label>

        {error && <p className="text-sm font-medium text-danger">{error}</p>}
        {info && <p className="text-sm font-medium text-success">{info}</p>}

        <button
          type="submit"
          disabled={!configured || loading}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading
            ? "Please wait…"
            : mode === "signin"
              ? "Log in"
              : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setInfo(null);
        }}
        className="mt-4 w-full text-center text-sm text-muted hover:text-fg"
      >
        {mode === "signin"
          ? "New here? Create an account"
          : "Already have an account? Log in"}
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-faint">
        <div className="h-px flex-1 bg-line" />
        or continue with
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["Google", "Facebook"] as const).map((p) => (
          <button
            key={p}
            type="button"
            disabled={!configured}
            onClick={() => oauth(p.toLowerCase() as "google" | "facebook")}
            className="flex h-11 items-center justify-center rounded-full border border-line-strong text-sm font-medium text-fg transition-colors hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Want to enter a fish?{" "}
        <Link href="/register" className="font-semibold text-gold">
          Register a fish
        </Link>
      </p>

      <style>{`
        .auth-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-line);
          background: var(--color-surface-2);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--color-fg);
          outline: none;
        }
        .auth-input:focus {
          border-color: rgba(243, 198, 19, 0.6);
          box-shadow: 0 0 0 3px rgba(243, 198, 19, 0.12);
        }
        .auth-input::placeholder { color: var(--color-faint); }
        .auth-input:disabled { opacity: 0.5; }
      `}</style>
    </Card>
  );
}
