"use client";

import { Clock, Link2, ArrowUpDown, Trophy, User, Zap } from "lucide-react";
import { useComingSoon } from "@/app/providers";

const filters = [
  { key: "24h", label: "24H", icon: Clock },
  { key: "chains", label: "All Chains", icon: Link2 },
  { key: "sort", label: "Sort", icon: ArrowUpDown },
  { key: "rank", label: "Rank", icon: Trophy },
  { key: "profile", label: "Profile", icon: User },
  { key: "boost", label: "Boost", icon: Zap },
] as const;

export function ScreenerFilterBar() {
  const { openComingSoon } = useComingSoon();

  return (
    <div className="flex gap-2 overflow-x-auto px-6 pb-2">
      {filters.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => openComingSoon(label)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/20 px-3 py-1.5 text-xs text-sage transition-colors hover:text-ivory"
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
          {label}
        </button>
      ))}
    </div>
  );
}
