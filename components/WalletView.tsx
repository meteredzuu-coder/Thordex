"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  LogOut,
  Wallet as WalletIcon,
} from "lucide-react";
import { useComingSoon, useWallet } from "@/app/providers";
import { KRYVORA_FAUCET_URL, KRYVORA_NETWORK } from "@/lib/network";
import { coins } from "@/lib/coins";
import { formatPrice } from "@/lib/format";
import { CoinAvatar } from "./CoinAvatar";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// Kepemilikan contoh (mock) — ganti dengan saldo token on-chain asli saat backend sudah siap.
const mockHoldings: Record<string, number> = {
  thor: 128.4,
  nova: 340,
  aeris: 6.2,
};

export function WalletView() {
  const { address, balance, connecting, error, connect, disconnect } = useWallet();
  const { openComingSoon } = useComingSoon();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard tidak tersedia — abaikan
    }
  }

  const holdings = coins
    .filter((c) => mockHoldings[c.id])
    .map((c) => ({ coin: c, qty: mockHoldings[c.id] }));

  const holdingsValue = holdings.reduce((sum, h) => sum + h.qty * h.coin.price, 0);

  if (!address) {
    return (
      <div className="px-6">
        <div className="mt-4 rounded-2xl border border-gold/25 bg-surface p-7 text-center shadow-jade-glow">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-emerald-deep">
            <WalletIcon className="h-6 w-6 text-gold" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-xl text-ivory">Hubungkan Wallet Anda</h1>
          <p className="mt-2 text-sm leading-relaxed text-sage">
            Hubungkan wallet untuk melihat saldo, aset, dan mulai transaksi di {KRYVORA_NETWORK.chainName}.
          </p>

          <button
            onClick={connect}
            disabled={connecting}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-jade to-jade-bright text-sm font-semibold text-obsidian shadow-jade-glow transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <WalletIcon className="h-4 w-4" strokeWidth={2} />
            {connecting ? "Menghubungkan…" : "Connect Wallet"}
          </button>

          {error && <p className="mt-3 text-xs text-danger">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-4">
      {/* Kartu akun */}
      <div className="mt-4 rounded-2xl border border-gold/25 bg-surface p-5 shadow-jade-glow">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/40 bg-jade/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-jade-bright">
            <span className="h-1.5 w-1.5 rounded-full bg-jade-bright" />
            {KRYVORA_NETWORK.chainName}
          </span>
          <button
            onClick={disconnect}
            aria-label="Putuskan wallet"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/30 text-sage transition-colors hover:border-danger/50 hover:text-danger"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>

        <p className="mt-5 font-mono text-lg text-ivory">{shortenAddress(address)}</p>
        <button
          onClick={handleCopy}
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-sage transition-colors hover:text-gold"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-jade" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Alamat disalin" : "Salin alamat"}
        </button>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-sage">Total Saldo</p>
          <p className="mt-1 font-display text-3xl text-ivory">
            {balance ?? "0.0000"}{" "}
            <span className="text-lg text-sage">{KRYVORA_NETWORK.nativeCurrency.symbol}</span>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            onClick={() => openComingSoon("Send")}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-gold/20 bg-obsidian py-3 text-[11px] font-medium text-ivory transition-colors hover:border-jade/40"
          >
            <ArrowUpRight className="h-4 w-4 text-jade" strokeWidth={1.75} />
            Send
          </button>
          <button
            onClick={() => openComingSoon("Receive")}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-gold/20 bg-obsidian py-3 text-[11px] font-medium text-ivory transition-colors hover:border-jade/40"
          >
            <ArrowDownLeft className="h-4 w-4 text-jade" strokeWidth={1.75} />
            Receive
          </button>
          <button
            onClick={() => openComingSoon("Buy")}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-gold/20 bg-obsidian py-3 text-[11px] font-medium text-ivory transition-colors hover:border-jade/40"
          >
            <CreditCard className="h-4 w-4 text-jade" strokeWidth={1.75} />
            Buy
          </button>
        </div>
      </div>

      {/* Link faucet */}
      <a
        href={KRYVORA_FAUCET_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-between rounded-xl border border-gold/15 bg-surface px-4 py-3 text-xs text-sage transition-colors hover:border-gold/30"
      >
        Butuh ETH testnet? Klaim di faucet {KRYVORA_NETWORK.chainName}
        <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      </a>

      {/* Daftar aset */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <span className="whitespace-nowrap font-display text-[11px] uppercase tracking-[0.3em] text-gold">
            Aset Anda
          </span>
          <span className="font-mono text-xs text-sage">{formatPrice(holdingsValue)}</span>
        </div>

        {holdings.length === 0 ? (
          <div className="rounded-2xl border border-gold/15 bg-surface px-4 py-6 text-center text-xs text-sage">
            Belum ada aset token di wallet ini.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gold/20">
            {holdings.map(({ coin, qty }, i) => (
              <button
                key={coin.id}
                onClick={() => openComingSoon(`Detail ${coin.name}`)}
                className={`flex w-full items-center gap-3 bg-surface px-4 py-3.5 text-left transition-colors hover:bg-surface2 ${
                  i === holdings.length - 1 ? "" : "border-b border-gold/10"
                }`}
              >
                <CoinAvatar coin={coin} size={40} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ivory">{coin.name}</p>
                  <p className="font-mono text-xs text-sage">
                    {qty.toLocaleString("en-US")} {coin.symbol}
                  </p>
                </div>
                <p className="text-right font-mono text-sm text-ivory">{formatPrice(qty * coin.price)}</p>
              </button>
            ))}
          </div>
        )}
        <p className="mt-3 px-1 text-[11px] leading-relaxed text-sage">
          Data aset masih contoh (mock) — akan tersambung ke saldo on-chain asli saat backend siap.
        </p>
      </section>
    </div>
  );
}
