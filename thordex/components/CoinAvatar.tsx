import type { Coin } from "@/lib/coins";

export function CoinAvatar({ coin, size = 44 }: { coin: Coin; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-gold/40 font-display text-[13px] text-ivory"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${coin.accent}66, #0B241A 60%, #07090A 100%)`,
      }}
    >
      {coin.initials}
    </div>
  );
}
