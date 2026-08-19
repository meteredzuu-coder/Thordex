"use client";

import type { Coin } from "@/lib/coins";
import { formatChange, formatPrice } from "@/lib/format";
import { CoinAvatar } from "./CoinAvatar";
import { useComingSoon } from "@/app/providers";

export function CoinRow({ coin, last }: { coin: Coin; last?: boolean }) {
  const { openComingSoon } = useComingSoon();
  const up = coin.change24h >= 0;

  return (
    <button
      onClick={() => openComingSoon(`Detail ${coin.name}`)}
      className={`flex w-full items-center gap-3 bg-surface px-4 py-3.5 text-left transition-colors hover:bg-surface2 ${
        last ? "" : "border-b border-gold/10"
      }`}
    >
      <CoinAvatar coin={coin} size={40} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-ivory">{coin.name}</p>
        <p className="text-xs text-sage">{coin.symbol}</p>
      </div>
      <div className="text-right font-mono text-sm">
        <p className="text-ivory">{formatPrice(coin.price)}</p>
        <p className={up ? "text-jade" : "text-danger"}>{formatChange(coin.change24h)}</p>
      </div>
    </button>
  );
}
