import type { Metadata, Viewport } from "next";
import { Luckiest_Guy, Fredoka } from "next/font/google";
import { event } from "@/lib/event";
import "./globals.css";

const display = Luckiest_Guy({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const body = Fredoka({
  variable: "--font-body",
  subsets: ["latin"],
});

const description = `¡${event.celebrant} cumple ${event.age} año! Te esperamos el ${event.dateLabel.toLowerCase()} bajo la gran carpa. 🎪`;

export const metadata: Metadata = {
  // URL pública del sitio; sin ella los links de la imagen de previsualización no son absolutos.
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: `Invitación · ${event.title}`,
  description,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: event.title,
    title: `${event.title} 🎈`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${event.title} 🎈`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#d62828",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
