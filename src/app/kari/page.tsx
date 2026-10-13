import Landing from "@/components/Landing";
import { event } from "@/lib/event";

export default function KariPage() {
  return <Landing rsvp={event.rsvpKari} />;
}
