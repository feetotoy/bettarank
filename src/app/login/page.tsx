import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui";
import { isAuthConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";
import { DemoLogin } from "./demo-login";

export const metadata: Metadata = {
  title: "Log in",
  description: "Access your FINOY account.",
};

export default function LoginPage() {
  const configured = isAuthConfigured();
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Suspense>{configured ? <LoginForm /> : <DemoLogin />}</Suspense>
    </Container>
  );
}
