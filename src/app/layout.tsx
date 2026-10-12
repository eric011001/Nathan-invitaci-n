import type { Metadata } from "next";
import { Luckiest_Guy, Fredoka } from "next/font/google";
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
  title: "Invitación · Circo de Nathan",
  description: "¡Estás invitado a la fiesta de cumpleaños de Nathan! Pasa a la carpa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
