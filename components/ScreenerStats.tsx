import { screenerStats } from "@/lib/trending";

export function ScreenerStats() {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 px-6">
      <div className="rounded-2xl border border-gold/20 bg-surface px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage">24H Volume</p>
        <p className="mt-1 font-mono text-base text-ivory">{screenerStats.volume24h}</p>
      </div>
      <div className="rounded-2xl border border-gold/20 bg-surface px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage">24H Txns</p>
        <p className="mt-1 font-mono text-base text-ivory">{screenerStats.txns24h}</p>
      </div>
    </div>
  );
}
