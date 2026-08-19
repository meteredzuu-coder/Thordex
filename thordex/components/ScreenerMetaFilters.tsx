"use client";

import { ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { metaFilters } from "@/lib/trending";
import { useComingSoon } from "@/app/providers";

export function ScreenerMetaFilters() {
  const { openComingSoon } = useComingSoon();

  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto px-6 pb-1">
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-gold">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        Metas
      </span>
      {metaFilters.map((m) => (
        <button
          key={m.id}
          onClick={() => openComingSoon(m.label)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/20 bg-surface px-3 py-1.5 text-xs text-ivory"
        >
          <span>{m.emoji}</span>
          <span className="text-sage">{m.label}</span>
          <span className="font-mono">{m.value}</span>
          {m.trend === "up" ? (
            <ChevronUp className="h-3 w-3 text-jade" strokeWidth={2.5} />
          ) : (
            <ChevronDown className="h-3 w-3 text-danger" strokeWidth={2.5} />
          )}
        </button>
      ))}
    </div>
  );
}
