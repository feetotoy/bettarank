import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getCompetitions } from "@/lib/db/competitions";
import { handlerEntries, formatDate } from "@/lib/data";
import { Container } from "@/components/ui";
import {
  AccountProfile,
  type ShowLite,
  type HandledLite,
} from "./account-profile";

export const metadata: Metadata = {
  title: "My Account",
  description: "Your FINOY account — profile, photo, bio, and quick actions.",
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session.loggedIn || !session.role) {
    redirect("/login?next=/account");
  }
  const role = session.role;

  // Organizer → the shows they run; Handler → the codes they're benching.
  const shows: ShowLite[] =
    role === "organizer"
      ? (await getCompetitions()).map((c) => ({
          slug: c.slug,
          name: c.name,
          city: c.city,
          date: formatDate(c.date),
          status: c.status,
          entries: c.entries,
        }))
      : [];

  const handled: HandledLite[] =
    role === "handler"
      ? handlerEntries.map((e) => ({
          code: e.code,
          className: e.className,
          division: e.divisionAbbr,
          owner: e.owner,
          status: e.status,
        }))
      : [];

  return (
    <Container className="py-12">
      <AccountProfile
        role={role}
        email={session.email}
        demo={session.demo}
        shows={shows}
        handled={handled}
      />
    </Container>
  );
}
