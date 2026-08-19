"use client";

import { useState } from "react";
import { ChevronDown, Droplets, Plus, Wallet as WalletIcon, X } from "lucide-react";
import { useComingSoon, useWallet } from "@/app/providers";
import { swapTokens, findToken } from "@/lib/pools";
import { formatPrice } from "@/lib/format";
import type { Coin } from "@/lib/coins";
import { CoinAvatar } from "./CoinAvatar";
import { TokenSelectModal } from "./TokenSelectModal";

// Saldo contoh (mock) per token — sama seperti di halaman Swap, ganti dengan saldo on-chain asli nanti.
const mockBalances: Record<string, number> = {
  thor: 128.4,
  nova: 340,
  aeris: 6.2,
  lumen: 2140,
  vaultx: 3.1,
  ember: 58.7,
};

export function AddLiquiditySheet({
  open,
  tokenAId,
  tokenBId,
  poolTvl,
  onClose,
}: {
  open: boolean;
  tokenAId: string;
  tokenBId: string;
  poolTvl: number;
  onClose: () => void;
}) {
  const { address, balance: nativeBalance, connect, connecting } = useWallet();
  const { openComingSoon } = useComingSoon();

  const [tokenA, setTokenA] = useState<Coin>(findToken(tokenAId));
  const [tokenB, setTokenB] = useState<Coin>(findToken(tokenBId));
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [selecting, setSelecting] = useState<"a" | "b" | null>(null);

  if (!open) return null;

  const balanceOf = (t: Coin) => (t.id === "native" ? parseFloat(nativeBalance ?? "0") : mockBalances[t.id] ?? 0);

  function handleAmountAChange(v: string) {
    if (!/^\d*\.?\d*$/.test(v)) return;
    setAmountA(v);
    const num = parseFloat(v) || 0;
    if (num > 0) {
      const equivalent = (num * tokenA.price) / tokenB.price;
      setAmountB(equivalent.toLocaleString("en-US", { maximumFractionDigits: 6 }));
    } else {
      setAmountB("");
    }
  }

  function handleAmountBChange(v: string) {
    if (!/^\d*\.?\d*$/.test(v)) return;
    setAmountB(v);
    const num = parseFloat(v) || 0;
    if (num > 0) {
      const equivalent = (num * tokenB.price) / tokenA.price;
      setAmountA(equivalent.toLocaleString("en-US", { maximumFractionDigits: 6 }));
    } else {
      setAmountA("");
    }
  }

  function handleSelect(token: Coin) {
    if (selecting === "a") {
      if (token.id === tokenB.id) setTokenB(tokenA);
      setTokenA(token);
    } else if (selecting === "b") {
      if (token.id === tokenA.id) setTokenA(tokenB);
      setTokenB(token);
    }
    setAmountA("");
    setAmountB("");
  }

  const amountANum = parseFloat(amountA) || 0;
  const amountBNum = parseFloat(amountB) || 0;
  const depositUsd = amountANum * tokenA.price + amountBNum * tokenB.price;
  const poolShare = depositUsd > 0 ? (depositUsd / (poolTvl + depositUsd)) * 100 : 0;

  const insufficientA = address ? amountANum > balanceOf(tokenA) : false;
  const insufficientB = address ? amountBNum > balanceOf(tokenB) : false;

  let ctaLabel = "Tambah Likuiditas";
  if (!address) ctaLabel = "Connect Wallet";
  else if (amountANum <= 0 || amountBNum <= 0) ctaLabel = "Masukkan Jumlah";
  else if (insufficientA) ctaLabel = `Saldo ${tokenA.symbol} Tidak Cukup`;
  else if (insufficientB) ctaLabel = `Saldo ${tokenB.symbol} Tidak Cukup`;

  const ctaDisabled = Boolean(address) && (amountANum <= 0 || amountBNum <= 0 || insufficientA || insufficientB);

  function handleCta() {
    if (!address) {
      connect();
      return;
    }
    if (ctaDisabled) return;
    openComingSoon("Add Liquidity");
  }

  function handleClose() {
    setAmountA("");
    setAmountB("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-t-3xl border-t border-gold/25 bg-surface px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-ivory">Tambah Likuiditas</h3>
          <button onClick={handleClose} aria-label="Tutup" className="text-sage hover:text-ivory">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Token A */}
        <div className="mt-5 rounded-2xl border border-gold/20 bg-obsidian p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-sage">Token 1</span>
            {address && <span className="text-[11px] text-sage">Saldo: {balanceOf(tokenA).toLocaleString("en-US")}</span>}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input
              value={amountA}
              onChange={(e) => handleAmountAChange(e.target.value)}
              inputMode="decimal"
              placeholder="0.0"
              className="w-full min-w-0 bg-transparent font-display text-2xl text-ivory placeholder:text-sage/40 outline-none"
            />
            <button
              onClick={() => setSelecting("a")}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-surface py-1.5 pl-1.5 pr-3 transition-colors hover:border-jade/40"
            >
              <CoinAvatar coin={tokenA} size={26} />
              <span className="text-sm font-semibold text-ivory">{tokenA.symbol}</span>
              <ChevronDown className="h-3.5 w-3.5 text-sage" />
            </button>
          </div>
        </div>

        {/* Plus icon */}
        <div className="relative z-10 -my-3 flex justify-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-emerald-deep text-gold">
            <Plus className="h-4 w-4" strokeWidth={2} />
          </span>
        </div>

        {/* Token B */}
        <div className="rounded-2xl border border-gold/20 bg-obsidian p-4 pt-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-sage">Token 2</span>
            {address && <span className="text-[11px] text-sage">Saldo: {balanceOf(tokenB).toLocaleString("en-US")}</span>}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input
              value={amountB}
              onChange={(e) => handleAmountBChange(e.target.value)}
              inputMode="decimal"
              placeholder="0.0"
              className="w-full min-w-0 bg-transparent font-display text-2xl text-ivory placeholder:text-sage/40 outline-none"
            />
            <button
              onClick={() => setSelecting("b")}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-surface py-1.5 pl-1.5 pr-3 transition-colors hover:border-jade/40"
            >
              <CoinAvatar coin={tokenB} size={26} />
              <span className="text-sm font-semibold text-ivory">{tokenB.symbol}</span>
              <ChevronDown className="h-3.5 w-3.5 text-sage" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-2.5 rounded-xl border border-gold/15 bg-obsidian px-4 py-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-sage">Nilai Setoran</span>
            <span className="font-mono text-ivory">{formatPrice(depositUsd)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-sage">Estimasi Pangsa Pool</span>
            <span className="font-mono text-ivory">{depositUsd > 0 ? `${poolShare.toFixed(3)}%` : "—"}</span>
          </div>
        </div>

        <button
          onClick={handleCta}
          disabled={connecting || ctaDisabled}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-jade to-jade-bright text-sm font-semibold text-obsidian shadow-jade-glow transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {!address ? <WalletIcon className="h-4 w-4" strokeWidth={2} /> : <Droplets className="h-4 w-4" strokeWidth={2} />}
          {connecting ? "Menghubungkan…" : ctaLabel}
        </button>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-sage">
          Data pool & rate masih contoh (mock) — akan tersambung ke kontrak likuiditas asli saat backend siap.
        </p>
      </div>

      <TokenSelectModal
        open={selecting !== null}
        tokens={swapTokens}
        selectedId={selecting === "a" ? tokenA.id : tokenB.id}
        excludeId={selecting === "a" ? tokenB.id : tokenA.id}
        onSelect={handleSelect}
        onClose={() => setSelecting(null)}
      />
    </div>
  );
}
