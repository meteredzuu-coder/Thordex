import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Thordex — Bursa Kripto Premium",
  description:
    "Thordex: bursa, launchpad, dan dompet multi-chain dengan identitas hitam-emerald yang mewah.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body
        className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable} font-body bg-obsidian text-ivory antialiased`}
      >
        <AppProviders>
          <Header />
          <main className="mx-auto min-h-screen w-full max-w-[560px] pb-28 pt-20">
            {children}
          </main>
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
