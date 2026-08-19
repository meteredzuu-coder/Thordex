import { topCoin } from "@/lib/coins";
import { formatChange, formatPrice } from "@/lib/format";
import { CoinAvatar } from "./CoinAvatar";
import { SectionHeading } from "./SectionHeading";

export function TopCoinInfo() {
  const up = topCoin.change24h >= 0;

  return (
    <section className="mb-9">
      <SectionHeading>Top Coin</SectionHeading>
      <div className="mx-6 rounded-2xl border border-gold/25 bg-surface p-5 shadow-jade-glow">
        <div className="flex items-center gap-4">
          <CoinAvatar coin={topCoin} size={52} />
          <div className="flex-1">
            <p className="font-display text-lg text-ivory">{topCoin.name}</p>
            <p className="text-xs uppercase tracking-widest text-sage">{topCoin.symbol}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg text-ivory">{formatPrice(topCoin.price)}</p>
            <p className={`font-mono text-xs ${up ? "text-jade" : "text-danger"}`}>
              {formatChange(topCoin.change24h)}
            </p>
          </div>
        </div>

        <svg viewBox="0 0 200 40" className="mt-4 h-10 w-full text-jade/70" fill="none">
          <path
            d="M0 30 L25 24 L50 28 L75 14 L100 20 L125 8 L150 16 L175 6 L200 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
