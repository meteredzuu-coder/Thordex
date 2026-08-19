"use client";

import { Zap } from "lucide-react";
import type { NftItem } from "@/lib/nfts";
import { NftArt } from "./NftArt";
import { useComingSoon } from "@/app/providers";

export function NftCard({ item }: { item: NftItem }) {
  const { openComingSoon } = useComingSoon();

  return (
    <div className="overflow-hidden rounded-2xl border border-gold/20 bg-surface">
      <button onClick={() => openComingSoon(item.name)} className="block w-full text-left">
        <div className="relative">
          <NftArt accent={item.accent} pattern={item.pattern} className="aspect-square w-full" />
          {item.rarity && (
            <span className="absolute left-2 top-2 rounded-full border border-gold/50 bg-obsidian/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold backdrop-blur">
              {item.rarity}
            </span>
          )}
        </div>
        <div className="p-3 pb-0">
          <p className="truncate text-sm font-semibold text-ivory">{item.name}</p>
          <p className="mt-0.5 truncate text-xs text-sage">{item.collection}</p>
        </div>
      </button>

      <div className="flex items-center justify-between p-3 pt-2.5">
        <div className="font-mono text-xs leading-tight">
          <p className="text-sage">Price</p>
          <p className="text-ivory">{item.price} ETH</p>
        </div>
        <button
          onClick={() => openComingSoon(`Buy ${item.name}`)}
          className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-jade to-jade-bright px-3 py-1.5 text-[11px] font-semibold text-obsidian transition-opacity hover:opacity-90"
        >
          <Zap className="h-3 w-3" strokeWidth={2.5} />
          Buy Now
        </button>
      </div>
    </div>
  );
}
