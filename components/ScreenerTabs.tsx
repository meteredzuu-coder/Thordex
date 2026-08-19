"use client";

import { Flame, Sprout, BarChart3, ChevronDown } from "lucide-react";

const tabs = [
  { key: "trending", label: "Trending 6H", icon: Flame },
  { key: "new", label: "New", icon: Sprout },
  { key: "top", label: "Top", icon: BarChart3 },
] as const;

export type ScreenerTab = (typeof tabs)[number]["key"];

export function ScreenerTabs({
  active,
  onChange,
}: {
  active: ScreenerTab;
  onChange: (tab: ScreenerTab) => void;
}) {
  return (
    <div className="mb-3 flex gap-2 px-6">
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-jade text-obsidian shadow-jade-glow"
                : "border border-gold/20 text-sage hover:text-ivory"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            {label}
            {key === "trending" && <ChevronDown className="h-3 w-3" strokeWidth={2} />}
          </button>
        );
      })}
    </div>
  );
}
