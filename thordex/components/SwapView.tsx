"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ChevronDown, Repeat, Settings2, Wallet as WalletIcon } from "lucide-react";
import { useComingSoon, useWallet } from "@/app/providers";
import { swapTokens, nativeToken } from "@/lib/pools";
import { formatPrice } from "@/lib/format";
import { KRYVORA_NETWORK } from "@/lib/network";
import type { Coin } from "@/lib/coins";
import { CoinAvatar } from "./CoinAvatar";
import { TokenSelectModal } from "./TokenSelectModal";

// Saldo contoh (mock) per token — ganti dengan saldo on-chain asli saat backend sudah siap.
const mockBalances: Record<string, number> = {
  thor: 128.4,
  nova: 340,
  aeris: 6.2,
  lumen: 2140,
  vaultx: 3.1,
  ember: 58.7,
};

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0];
const FEE_RATE = 0.003; // 0.3%, standar biaya swap AMM

function formatAmount(value: number): string {
  if (!value) return "";
  return value.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export function SwapView() {
  const { address, balance: nativeBalance, connect, connecting } = useWallet();
  const { openComingSoon } = useComingSoon();

  const [fromToken, setFromToken] = useState<Coin>(nativeToken);
  const [toToken, setToToken] = useState<Coin>(swapTokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [selecting, setSelecting] = useState<"from" | "to" | null>(null);

  const fromAmountNum = parseFloat(fromAmount) || 0;
  const rate = fromToken.price / toToken.price;
  const toAmountNum = fromAmountNum > 0 ? fromAmountNum * rate * (1 - FEE_RATE) : 0;
  const minReceived = toAmountNum * (1 - slippage / 100);

  const fromBalance =
    fromToken.id === "native" ? parseFloat(nativeBalance ?? "0") : mockBalances[fromToken.id] ?? 0;
  const toBalance = toToken.id === "native" ? parseFloat(nativeBalance ?? "0") : mockBalances[toToken.id] ?? 0;

  const insufficientBalance = address ? fromAmountNum > fromBalance : false;

  function handleFlip() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmountNum > 0 ? formatAmount(toAmountNum) : "");
  }

  function handleSelect(token: Coin) {
    if (selecting === "from") {
      if (token.id === toToken.id) setToToken(fromToken);
      setFromToken(token);
    } else if (selecting === "to") {
      if (token.id === fromToken.id) setFromToken(toToken);
      setToToken(token);
    }
  }

  function handleMax() {
    setFromAmount(fromBalance > 0 ? String(fromBalance) : "");
  }

  const ctaLabel = useMemo(() => {
    if (!address) return "Connect Wallet";
    if (fromAmountNum <= 0) return "Masukkan Jumlah";
    if (insufficientBalance) return `Saldo ${fromToken.symbol} Tidak Cukup`;
    return "Swap";
  }, [address, fromAmountNum, insufficientBalance, fromToken.symbol]);

  const ctaDisabled = Boolean(address) && (fromAmountNum <= 0 || insufficientBalance);

  function handleCta() {
    if (!address) {
      connect();
      return;
    }
    if (ctaDisabled) return;
    openComingSoon("Swap");
  }

  return (
    <div className="px-6 pb-4">
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ivory">Swap</h1>
          <p className="mt-1 text-sm text-sage">Tukar token secara instan di {KRYVORA_NETWORK.chainName}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/25 text-sage">
          <Settings2 className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>

      {/* Kartu tukar */}
      <div className="relative mt-6">
        {/* Anda Bayar */}
        <div className="rounded-2xl border border-gold/20 bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-sage">Anda Bayar</span>
            {address && (
              <button onClick={handleMax} className="text-[11px] font-medium text-jade-bright hover:underline">
                Saldo: {formatAmount(fromBalance)} · Maks
              </button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input
              value={fromAmount}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*\.?\d*$/.test(v)) setFromAmount(v);
              }}
              inputMode="decimal"
              placeholder="0.0"
              className="w-full min-w-0 bg-transparent font-display text-2xl text-ivory placeholder:text-sage/40 outline-none"
            />
            <button
              onClick={() => setSelecting("from")}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-obsidian py-1.5 pl-1.5 pr-3 transition-colors hover:border-jade/40"
            >
              <CoinAvatar coin={fromToken} size={26} />
              <span className="text-sm font-semibold text-ivory">{fromToken.symbol}</span>
              <ChevronDown className="h-3.5 w-3.5 text-sage" />
            </button>
          </div>
          {fromAmountNum > 0 && (
            <p className="mt-1.5 text-xs text-sage">{formatPrice(fromAmountNum * fromToken.price)}</p>
          )}
        </div>

        {/* Tombol balik arah */}
        <div className="relative z-10 -my-3 flex justify-center">
          <button
            onClick={handleFlip}
            aria-label="Balik arah swap"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-emerald-deep text-jade-bright shadow-jade-glow transition-transform hover:rotate-180"
          >
            <ArrowDown className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Anda Terima */}
        <div className="rounded-2xl border border-gold/20 bg-surface p-4 pt-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-sage">Anda Terima</span>
            {address && <span className="text-[11px] text-sage">Saldo: {formatAmount(toBalance)}</span>}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <p className="w-full min-w-0 truncate font-display text-2xl text-ivory">
              {toAmountNum > 0 ? formatAmount(toAmountNum) : <span className="text-sage/40">0.0</span>}
            </p>
            <button
              onClick={() => setSelecting("to")}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-obsidian py-1.5 pl-1.5 pr-3 transition-colors hover:border-jade/40"
            >
              <CoinAvatar coin={toToken} size={26} />
              <span className="text-sm font-semibold text-ivory">{toToken.symbol}</span>
              <ChevronDown className="h-3.5 w-3.5 text-sage" />
            </button>
          </div>
          {toAmountNum > 0 && <p className="mt-1.5 text-xs text-sage">{formatPrice(toAmountNum * toToken.price)}</p>}
        </div>
      </div>

      {/* Info rate & slippage */}
      <div className="mt-4 space-y-2.5 rounded-xl border border-gold/15 bg-surface px-4 py-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-sage">Rate</span>
          <span className="font-mono text-ivory">
            1 {fromToken.symbol} ≈ {formatAmount(rate)} {toToken.symbol}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-sage">Biaya Swap</span>
          <span className="font-mono text-ivory">0.3%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-sage">Slippage Tolerance</span>
          <div className="flex gap-1.5">
            {SLIPPAGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setSlippage(opt)}
                className={`rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  slippage === opt
                    ? "bg-jade/20 text-jade-bright"
                    : "bg-obsidian text-sage hover:text-ivory"
                }`}
              >
                {opt}%
              </button>
            ))}
          </div>
        </div>
        {fromAmountNum > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-sage">Minimum Diterima</span>
            <span className="font-mono text-ivory">
              {formatAmount(minReceived)} {toToken.symbol}
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={handleCta}
        disabled={connecting || ctaDisabled}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-jade to-jade-bright text-sm font-semibold text-obsidian shadow-jade-glow transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {!address ? <WalletIcon className="h-4 w-4" strokeWidth={2} /> : <Repeat className="h-4 w-4" strokeWidth={2} />}
        {connecting ? "Menghubungkan…" : ctaLabel}
      </button>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-sage">
        Harga & rate masih data contoh (mock) — akan tersambung ke likuiditas on-chain asli saat backend siap.
      </p>

      <TokenSelectModal
        open={selecting !== null}
        tokens={swapTokens}
        selectedId={selecting === "from" ? fromToken.id : toToken.id}
        excludeId={selecting === "from" ? toToken.id : fromToken.id}
        onSelect={handleSelect}
        onClose={() => setSelecting(null)}
      />
    </div>
  );
}
