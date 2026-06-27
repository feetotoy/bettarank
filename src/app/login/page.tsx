import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Access your FINOY account.",
};

export default function LoginPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
