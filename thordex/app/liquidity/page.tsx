import type { Metadata } from "next";
import { LiquidityView } from "@/components/LiquidityView";

export const metadata: Metadata = {
  title: "Liquidity — Thordex",
  description: "Sediakan likuiditas dan dapatkan bagian dari biaya swap di Kryvora Network.",
};

export default function LiquidityPage() {
  return <LiquidityView />;
}
