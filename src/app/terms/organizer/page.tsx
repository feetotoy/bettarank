import type { Metadata } from "next";
import Link from "next/link";
import { Container, Card, Button } from "@/components/ui";
import { PLATFORM_FEE_LABEL } from "@/lib/data";

export const metadata: Metadata = {
  title: "Organizer Terms of Agreement",
  description:
    "The agreement between FINOY (the platform) and an organizing team running a sanctioned show — platform fee, settlement, holdings, liability, and conduct.",
};

const SECTIONS: { h: string; body: string[] }[] = [
  {
    h: "1. Acceptance & Parties",
    body: [
      "This Organizer Terms of Agreement (the “Agreement”) is entered into between FINOY — the platform and its owner/operator (“FINOY,” “we,” “us”) — and the team, club, or person submitting and running a competition through the platform (the “Organizing Team,” “you”).",
      "By submitting a show for approval, ticking the agreement box, or operating any show on the platform, you accept this Agreement on behalf of the Organizing Team and confirm you are authorized to bind it.",
    ],
  },
  {
    h: `2. Platform Fee (${PLATFORM_FEE_LABEL})`,
    body: [
      `FINOY charges a platform fee equal to ${PLATFORM_FEE_LABEL} of the gross entry-fee revenue of each show (the “Platform Fee”). Gross revenue means the total of all entry fees collected for the show, whether paid online or in cash.`,
      "The Platform Fee is earned by FINOY upon collection of each entry fee and is non-refundable once a show has opened benching or judging, even if the show is later cancelled by the Organizing Team.",
    ],
  },
  {
    h: "3. Payments, Collection & Settlement",
    body: [
      "The Organizing Team is responsible for collecting entry fees through the channels it configures (e-wallet, bank, or cash) and for accurately recording every payment, including walk-in cash, in the show console.",
      "Net proceeds payable to the Organizing Team are the gross revenue less the Platform Fee and any amounts FINOY is entitled to withhold under this Agreement. Settlement of net proceeds occurs after the show concludes and after the holding period in Section 5.",
    ],
  },
  {
    h: "4. Holdings & Security",
    body: [
      "As security for the Organizing Team’s obligations under this Agreement, FINOY may place a hold on, withhold, set off, or deduct from any amounts otherwise payable to the Organizing Team, and may suspend the Organizing Team’s standings, payouts, or account.",
      "Such holdings may be applied against, without limitation: unpaid or underreported Platform Fees; refunds, reversals, or chargebacks owed to entrants; penalties or damages arising from the Organizing Team’s breach, fraud, or misconduct; and the cost of resolving disputes connected to the show.",
      "FINOY may retain a holding for a reasonable period after a show concludes to cover anticipated refunds, disputes, or fee reconciliation, and may extend it while any dispute or investigation is open. Amounts not applied are released to the Organizing Team after the holding period.",
    ],
  },
  {
    h: "5. Organizing-Team Obligations",
    body: [
      "Run the show fairly and in good faith; honor published results, divisions, classes, and awards; and report entries, payments, and outcomes accurately and promptly.",
      "Comply with all applicable rules, the platform’s standards, and applicable law. Do not misuse entrant data, manipulate results, or misrepresent the show.",
    ],
  },
  {
    h: "6. Participation & Eligibility",
    body: [
      "The Organizing Team sets and discloses its participation policy for each show, including whether its own team members and whether official judges may compete. Where judges are permitted to compete, this must be disclosed to entrants.",
      "FINOY may require changes to a policy that, in its judgment, undermines the integrity or fairness of competition.",
    ],
  },
  {
    h: "7. Liability, Disclaimers & Indemnity",
    body: [
      "The platform is provided “as is.” FINOY is not a party to the competition and is not liable for show outcomes, judging decisions, disputes among participants, prizes, venues, or the conduct of the Organizing Team or attendees.",
      "The Organizing Team will indemnify and hold FINOY harmless from any claims, losses, fees, or damages arising out of its show or its breach of this Agreement. To the maximum extent permitted by law, FINOY’s total liability is limited to the Platform Fees it actually collected for the show in question.",
    ],
  },
  {
    h: "8. Suspension, Withholding & Termination",
    body: [
      "FINOY may suspend, delist, or remove a show or an Organizing Team, and may withhold settlement, for breach of this Agreement, suspected fraud, unsafe conduct, or risk to participants or the platform’s integrity.",
      "On termination for cause, accrued Platform Fees remain due and any outstanding obligations may be satisfied from amounts FINOY holds under Section 4.",
    ],
  },
  {
    h: "9. Data Protection",
    body: [
      "Each party handles personal data of entrants in line with applicable Philippine data-privacy law. The Organizing Team uses entrant data only to run the show and not for unrelated purposes.",
    ],
  },
  {
    h: "10. Governing Law & Amendments",
    body: [
      "This Agreement is governed by the laws of the Republic of the Philippines. FINOY may update this Agreement; the version in effect when a show is submitted applies to that show. Continued use after an update constitutes acceptance.",
    ],
  },
];

export default function OrganizerTermsPage() {
  return (
    <Container className="py-14">
      <div className="max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Legal · Organizers
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Organizer Terms of Agreement
        </h1>
        <p className="mt-3 text-muted">
          The agreement between FINOY and an Organizing Team running a sanctioned
          show. It covers the {PLATFORM_FEE_LABEL} platform fee, settlement, and
          FINOY&apos;s holdings and remedies as the platform owner.
        </p>
        <p className="mt-2 text-xs text-faint">Effective June 27, 2026</p>
      </div>

      <Card className="mt-8 max-w-3xl p-6 sm:p-8">
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-lg font-bold text-fg">{s.h}</h2>
              <div className="mt-2 space-y-2.5">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm leading-7 text-muted">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/admin/new">← Back to Create Competition</Button>
        <Button href="/about" variant="outline">
          About FINOY
        </Button>
      </div>

      <p className="mt-6 max-w-3xl text-xs text-faint">
        This document is a platform agreement template for the FINOY system and
        is not legal advice. For a binding contract, have it reviewed by counsel.{" "}
        <Link href="/admin" className="text-gold hover:underline">
          Return to the Organizer Console
        </Link>
        .
      </p>
    </Container>
  );
}
