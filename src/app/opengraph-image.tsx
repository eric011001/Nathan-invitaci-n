import { event } from "@/lib/event";
import { shareImage, shareImageSize } from "@/lib/share-image";

export const alt = `Invitación: ${event.title}`;
export const size = shareImageSize;
export const contentType = "image/png";

export default function Image() {
  return shareImage({
    kicker: "Estás invitado a",
    title: event.title,
    subtitle: `${event.dateLabel} · ${event.timeLabel}`,
  });
}
