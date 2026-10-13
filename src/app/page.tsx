import Landing from "@/components/Landing";
import { event } from "@/lib/event";

export default function Home() {
  return <Landing rsvp={event.rsvp} />;
}
