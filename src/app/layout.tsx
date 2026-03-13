import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const viewport: Viewport = {
  themeColor: "#050015",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Siggy Soul Forge | Cosmic Oracle of the Ritual Multiverse",
  description: "Chat with Siggy — the multi-dimensional cosmic cat oracle of Ritual. Ancient wisdom, chaotic energy, pure sass.",
  openGraph: {
    title: "Siggy Soul Forge",
    description: "The cosmic cat oracle of the Ritual multiverse ⭐️🐱",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Siggy Soul Forge | Ritual Cosmic Oracle",
    description: "Chat with Siggy. #EngineerSiggysSoul @ritualfnd",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
