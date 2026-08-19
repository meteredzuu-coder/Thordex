import { trendingTokens, type TrendingToken } from "@/lib/trending";
import { ScreenerTokenRow } from "./ScreenerTokenRow";

export function ScreenerTokenList({ tokens = trendingTokens }: { tokens?: TrendingToken[] }) {
  return (
    <section className="mb-4">
      <div className="mx-6 overflow-hidden rounded-2xl border border-gold/20">
        {tokens.map((token, i) => (
          <ScreenerTokenRow key={token.id} token={token} last={i === tokens.length - 1} />
        ))}
      </div>
    </section>
  );
}
