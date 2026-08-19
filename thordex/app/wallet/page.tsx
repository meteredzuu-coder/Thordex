import type { Metadata } from "next";
import { WalletView } from "@/components/WalletView";

export const metadata: Metadata = {
  title: "Wallet — Thordex",
  description: "Kelola wallet, saldo, dan aset Anda di Kryvora Network.",
};

export default function WalletPage() {
  return <WalletView />;
}
