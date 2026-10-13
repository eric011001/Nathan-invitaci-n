import { event } from "@/lib/event";
import { shareImage, shareImageSize } from "@/lib/share-image";

export const alt = `Recuerdos de la fiesta de ${event.celebrant}`;
export const size = shareImageSize;
export const contentType = "image/png";

export default function Image() {
  return shareImage({
    kicker: event.title,
    title: "¡Comparte tus recuerdos!",
    subtitle: "Sube tus fotos y videos de la función",
  });
}
