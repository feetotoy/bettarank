import type { Metadata } from "next";
import Link from "next/link";
import { Container, Card, Button } from "@/components/ui";
import { BrandLogo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Log in",
  description: "Access your FINOY account.",
};

export default function LoginPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center">
          <BrandLogo className="h-12 w-auto" />
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted">
            Log in to manage your fish, entries &amp; rankings.
          </p>
        </div>

        <form className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-faint">
              Email
            </span>
            <input
              type="email"
              placeholder="you@example.com"
              className="auth-input"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-faint">
              Password
            </span>
            <input type="password" placeholder="••••••••" className="auth-input" />
          </label>

          <Button href="/" className="w-full">
            Log in
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-faint">
          <div className="h-px flex-1 bg-line" />
          or continue with
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {["Google", "Facebook"].map((p) => (
            <button
              key={p}
              type="button"
              className="flex h-11 items-center justify-center rounded-full border border-line-strong text-sm font-medium text-fg transition-colors hover:border-gold/50 hover:text-gold"
            >
              {p}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          New to FINOY?{" "}
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
        `}</style>
      </Card>
    </Container>
  );
}
