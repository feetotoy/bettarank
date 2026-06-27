import { Container, Button } from "@/components/ui";
import { BrandLogo } from "@/components/logo";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <BrandLogo className="h-14 w-auto opacity-90" />
      <p className="mt-6 font-display text-6xl font-extrabold text-gradient-gold">
        404
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
        This fish swam off
      </h1>
      <p className="mt-2 max-w-sm text-muted">
        The page you&apos;re looking for isn&apos;t benched here. Check the
        rankings or browse upcoming competitions instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">Back home</Button>
        <Button href="/rankings" variant="outline">
          View rankings
        </Button>
      </div>
    </Container>
  );
}
