"use client";

import { useState } from "react";
import { nftItems, type NftCategory } from "@/lib/nfts";
import { SectionHeading } from "./SectionHeading";
import { NftCard } from "./NftCard";

type Filter = NftCategory | "All";

const categories: Filter[] = ["All", "Art", "Gaming", "PFP", "Music", "Photography"];

export function NftExplore() {
  const [active, setActive] = useState<Filter>("All");
  const filtered = active === "All" ? nftItems : nftItems.filter((item) => item.category === active);

  return (
    <section className="mb-4">
      <SectionHeading>Explore NFTs</SectionHeading>

      <div className="mb-4 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              active === cat
                ? "border-jade/50 bg-jade/10 text-jade-bright"
                : "border-gold/20 text-sage hover:border-gold/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 px-6">
        {filtered.map((item) => (
          <NftCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
