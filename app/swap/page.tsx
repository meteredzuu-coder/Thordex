import type { Metadata } from "next";
import { SwapView } from "@/components/SwapView";

export const metadata: Metadata = {
  title: "Swap — Thordex",
  description: "Tukar token secara instan di Kryvora Network.",
};

export default function SwapPage() {
  return <SwapView />;
}
