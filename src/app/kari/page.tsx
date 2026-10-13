import type { Metadata } from "next";
import Landing from "@/components/Landing";
import { event } from "@/lib/event";
import { invitationMetadata } from "@/lib/metadata";

export const metadata: Metadata = invitationMetadata("/kari");

export default function KariPage() {
  return <Landing rsvp={event.rsvpKari} />;
}
