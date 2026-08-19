"use client";

import { Wallet } from "lucide-react";
import { useWallet } from "@/app/providers";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectButton({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const { address, connecting, error, connect, disconnect } = useWallet();
  const isFull = variant === "full";

  if (address) {
    return (
      <button
        onClick={disconnect}
        aria-label="Wallet terhubung"
        className={
          isFull
            ? "flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-jade/50 bg-jade/10 text-sm font-semibold text-jade-bright transition-colors hover:bg-jade/20"
            : "flex h-8 items-center gap-1.5 rounded-full border border-jade/50 bg-jade/10 px-3 text-[11px] font-semibold text-jade-bright transition-colors hover:bg-jade/20"
        }
      >
        <span className="h-1.5 w-1.5 rounded-full bg-jade-bright" />
        {shortenAddress(address)}
      </button>
    );
  }

  return (
    <div className={isFull ? "relative w-full" : "relative"}>
      <button
        onClick={connect}
        disabled={connecting}
        aria-label="Hubungkan wallet"
        className={
          isFull
            ? "flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gold/40 bg-emerald-deep/40 text-sm font-semibold tracking-wide text-gold transition-colors hover:bg-emerald-deep disabled:opacity-60"
            : "flex h-8 items-center gap-1.5 rounded-full border border-gold/40 px-3 text-[11px] font-semibold tracking-wide text-gold transition-colors hover:bg-emerald-deep disabled:opacity-60"
        }
      >
        <Wallet className={isFull ? "h-4 w-4" : "h-3.5 w-3.5"} strokeWidth={1.75} />
        {connecting ? "Menghubungkan…" : isFull ? "Connect Wallet" : "Connect"}
      </button>

      {error && (
        <span
          className={
            isFull
              ? "mt-2 block text-center text-[11px] text-danger"
              : "absolute right-0 top-10 whitespace-nowrap rounded-lg border border-danger/40 bg-surface px-2.5 py-1 text-[10px] text-danger shadow-gold-glow"
          }
        >
          {error}
        </span>
      )}
    </div>
  );
}
