"use client";

import { useCallback, useState } from "react";
import { Wallet } from "lucide-react";
import { ensureKryvoraNetwork } from "@/lib/network";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    const provider = (window as any).ethereum;

    if (!provider) {
      setError("Wallet tidak terdeteksi");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
      await ensureKryvoraNetwork(provider);
      setAddress(accounts[0] ?? null);
    } catch {
      setError("Gagal terhubung");
    } finally {
      setConnecting(false);
    }
  }, []);

  if (address) {
    return (
      <button
        onClick={() => setAddress(null)}
        aria-label="Wallet terhubung"
        className="flex h-8 items-center gap-1.5 rounded-full border border-jade/50 bg-jade/10 px-3 text-[11px] font-semibold text-jade-bright transition-colors hover:bg-jade/20"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-jade-bright" />
        {shortenAddress(address)}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={connect}
        disabled={connecting}
        aria-label="Hubungkan wallet"
        className="flex h-8 items-center gap-1.5 rounded-full border border-gold/40 px-3 text-[11px] font-semibold tracking-wide text-gold transition-colors hover:bg-emerald-deep disabled:opacity-60"
      >
        <Wallet className="h-3.5 w-3.5" strokeWidth={1.75} />
        {connecting ? "Menghubungkan…" : "Connect"}
      </button>

      {error && (
        <span className="absolute right-0 top-10 whitespace-nowrap rounded-lg border border-danger/40 bg-surface px-2.5 py-1 text-[10px] text-danger shadow-gold-glow">
          {error}
        </span>
      )}
    </div>
  );
}
