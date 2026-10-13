import type { Metadata, Viewport } from "next";
import { Luckiest_Guy, Fredoka } from "next/font/google";
import { invitationMetadata } from "@/lib/metadata";
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

export const metadata: Metadata = {
  // URL pública del sitio; sin ella los links de la imagen de previsualización no son absolutos.
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  ...invitationMetadata("/"),
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
