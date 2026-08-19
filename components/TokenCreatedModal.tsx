"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Droplets, ExternalLink, PartyPopper, X } from "lucide-react";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/contracts";

function shorten(value: string, head = 8, tail = 6) {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard tidak tersedia, abaikan
    }
  }

  return (
    <div className="rounded-xl border border-gold/20 bg-obsidian px-4 py-3">
      <span className="text-[11px] uppercase tracking-widest text-sage">{label}</span>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <span className="truncate font-mono text-sm text-ivory">{shorten(value)}</span>
        <button
          onClick={handleCopy}
          aria-label={`Salin ${label}`}
          className="flex shrink-0 items-center gap-1 rounded-full border border-jade/40 bg-jade/10 px-2.5 py-1 text-[11px] font-semibold text-jade-bright transition-colors hover:bg-jade/20"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
    </div>
  );
}

export function TokenCreatedModal({
  open,
  tokenAddress,
  txHash,
  onClose,
}: {
  open: boolean;
  tokenAddress: string | null;
  txHash: string | null;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!open || !tokenAddress || !txHash) return null;

  function handleAddLiquidity() {
    onClose();
    router.push(`/liquidity?token=${tokenAddress}`);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-jade/40 bg-surface p-7 text-center shadow-jade-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 text-sage hover:text-ivory"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-jade/50 bg-emerald-deep">
          <PartyPopper className="h-5 w-5 text-jade-bright" />
        </div>

        <p className="font-display text-xs uppercase tracking-[0.25em] text-jade-bright">Token Berhasil Dibuat</p>
        <h3 className="mt-2 font-display text-xl text-ivory">Token kamu sudah live di Kryvora</h3>
        <p className="mt-2 text-sm text-sage">Simpan alamat kontrak ini — kamu akan membutuhkannya untuk menambah likuiditas.</p>

        <div className="mt-5 space-y-3 text-left">
          <CopyRow label="Contract Address" value={tokenAddress} />
          <CopyRow label="Transaction Hash" value={txHash} />
        </div>

        <a
          href={explorerAddressUrl(tokenAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-sage transition-colors hover:text-gold"
        >
          Lihat token di explorer <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={explorerTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex items-center justify-center gap-1.5 text-xs text-sage transition-colors hover:text-gold"
        >
          Lihat transaksi di explorer <ExternalLink className="h-3 w-3" />
        </a>

        <button
          onClick={handleAddLiquidity}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-jade to-jade-bright text-sm font-semibold text-obsidian shadow-jade-glow transition-opacity hover:opacity-90"
        >
          <Droplets className="h-4 w-4" strokeWidth={2} />
          Add Your Liquidity
        </button>
        <button
          onClick={onClose}
          className="mt-3 w-full rounded-full border border-gold/30 py-2.5 text-sm font-semibold text-sage transition-colors hover:text-ivory"
        >
          Nanti saja
        </button>
      </div>
    </div>
  );
}
