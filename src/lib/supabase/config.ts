/**
 * True when the public Supabase keys are present (URL + anon). Safe to call on
 * both server and client (NEXT_PUBLIC_* vars are inlined at build). When false,
 * auth is disabled and the app runs in open/demo mode.
 */
export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
