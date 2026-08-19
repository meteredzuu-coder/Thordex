"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { useComingSoon } from "@/app/providers";
import { NftArt } from "./NftArt";
import type { ArtPattern } from "@/lib/nfts";

const previewTiles: { accent: string; pattern: ArtPattern }[] = [
  { accent: "#1FAE72", pattern: "radial" },
  { accent: "#C6A15B", pattern: "diagonal" },
  { accent: "#7C5CFF", pattern: "mesh" },
  { accent: "#3FE39A", pattern: "aurora" },
];

export function CreateNftBanner() {
  const { openComingSoon } = useComingSoon();

  return (
    <section className="mb-9 px-6">
      <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-surface p-6 shadow-jade-glow">
        <div className="pointer-events-none absolute -right-5 -top-5 grid w-32 grid-cols-2 gap-2 opacity-60 sm:w-36">
          {previewTiles.map((tile, i) => (
            <NftArt
              key={i}
              accent={tile.accent}
              pattern={tile.pattern}
              className="aspect-square rounded-lg border border-gold/20"
            />
          ))}
        </div>

        <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-jade/40 bg-jade/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-jade-bright">
          NFT Marketplace
        </span>

        <h2 className="relative z-10 mt-4 max-w-[210px] font-display text-xl leading-snug text-ivory">
          Want to create your own NFT?
        </h2>
        <p className="relative z-10 mt-2 max-w-[230px] text-sm text-sage">
          Click here and mint your art, music, or collectibles on Kryvora Network in minutes.
        </p>

        <button
          type="button"
          onClick={() => openComingSoon("Create Your NFT")}
          className="relative z-10 mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-jade to-jade-bright px-5 py-2.5 text-sm font-semibold text-obsidian shadow-jade-glow transition-opacity hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          Create Your NFT
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
