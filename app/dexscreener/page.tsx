import type { Metadata } from "next";
import { DexscreenerView } from "@/components/DexscreenerView";

export const metadata: Metadata = {
  title: "Dexscreener — Thordex",
  description: "Pantau token yang sedang trending, terbaru, dan teratas di seluruh chain.",
};

export default function DexscreenerPage() {
  return <DexscreenerView />;
}
