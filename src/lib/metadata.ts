import type { Metadata } from "next";
import { event } from "./event";

const description = `¡${event.celebrant} cumple ${event.age} año! Te esperamos el ${event.dateLabel.toLowerCase()} bajo la gran carpa. 🎪`;

// Metadata de la invitación (título, descripción y previsualización al compartir).
// `path` es la ruta de la página para que el link compartido apunte a ella.
export function invitationMetadata(path: string): Metadata {
  return {
    title: `Invitación · ${event.title}`,
    description,
    openGraph: {
      type: "website",
      locale: "es_MX",
      siteName: event.title,
      title: `${event.title} 🎈`,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} 🎈`,
      description,
    },
  };
}
