"use client";

import { BadgeCheck } from "lucide-react";
import type { NftCollection } from "@/lib/nfts";
import { NftArt } from "./NftArt";
import { useComingSoon } from "@/app/providers";

export function NftCollectionCard({ collection }: { collection: NftCollection }) {
  const { openComingSoon } = useComingSoon();

  return (
    <button
      onClick={() => openComingSoon(collection.name)}
      className="w-36 shrink-0 overflow-hidden rounded-2xl border border-gold/20 bg-surface text-left transition-colors hover:bg-surface2"
    >
      <NftArt accent={collection.accent} pattern={collection.pattern} className="aspect-square w-full" />
      <div className="p-3">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-semibold text-ivory">{collection.name}</p>
          {collection.verified && (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-jade-bright" strokeWidth={2} />
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-sage">{collection.creator}</p>
        <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
          <span className="text-sage">Floor</span>
          <span className="text-ivory">{collection.floorPrice} ETH</span>
        </div>
      </div>
    </button>
  );
}
