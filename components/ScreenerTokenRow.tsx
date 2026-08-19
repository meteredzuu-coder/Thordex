"use client";

import { ArrowLeftRight } from "lucide-react";
import type { TrendingToken } from "@/lib/trending";
import { formatScreenerPercent1h, formatScreenerPercent24h } from "@/lib/trending";
import { useComingSoon } from "@/app/providers";

export function ScreenerTokenRow({ token, last }: { token: TrendingToken; last?: boolean }) {
  const { openComingSoon } = useComingSoon();
  const up1h = token.change1h >= 0;
  const up24h = token.change24h >= 0;

  return (
    <button
      onClick={() => openComingSoon(`Detail ${token.symbol}`)}
      className={`flex w-full flex-col gap-2 bg-surface px-4 py-3 text-left transition-colors hover:bg-surface2 ${
        last ? "" : "border-b border-gold/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-jade/30 to-gold/20 text-jade-bright">
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <span className="rounded-full bg-jade/15 px-1.5 py-[1px] text-[8px] font-semibold uppercase tracking-wide text-jade-bright">
            Swap
          </span>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 font-display text-[12px] text-ivory"
          style={{
            background: `radial-gradient(circle at 30% 25%, ${token.accent}66, #0B241A 60%, #07090A 100%)`,
          }}
        >
          {token.initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`truncate text-sm font-semibold ${token.highlight ? "text-gold" : "text-ivory"}`}>
              {token.symbol}
            </span>
            {token.age && <span className="shrink-0 text-[10px] text-jade">🌱{token.age}</span>}
            {token.boost && <span className="shrink-0 text-[10px] text-gold">⚡{token.boost}</span>}
          </div>
          <p className="truncate text-xs text-sage">{token.name}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-mono text-sm text-ivory">
            $0.0
            {token.priceZeros ? <sub className="text-[10px]">{token.priceZeros}</sub> : null}
            {token.priceDigits}
          </p>
          <div className="flex items-center justify-end gap-2 font-mono text-[11px]">
            <span className="text-sage">
              1H <span className={up1h ? "text-jade" : "text-danger"}>{formatScreenerPercent1h(token.change1h)}</span>
            </span>
            <span className="text-sage">
              24H{" "}
              <span className={up24h ? "text-jade" : "text-danger"}>
                {formatScreenerPercent24h(token.change24h)}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pl-[52px] text-[10px] font-mono">
        <span className="rounded-md border border-gold/15 px-2 py-1 text-sage">
          LIQ <span className="text-ivory">{token.liq}</span>
        </span>
        <span className="rounded-md border border-gold/15 px-2 py-1 text-sage">
          VOL <span className="text-ivory">{token.vol}</span>
        </span>
        <span className="rounded-md border border-gold/15 px-2 py-1 text-sage">
          MCAP <span className="text-ivory">{token.mcap}</span>
        </span>
      </div>
    </button>
  );
}
