"use client";

import { useMemo, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { ScreenerTabs, type ScreenerTab } from "./ScreenerTabs";
import { ScreenerMetaFilters } from "./ScreenerMetaFilters";
import { ScreenerStats } from "./ScreenerStats";
import { ScreenerTokenList } from "./ScreenerTokenList";
import { ScreenerFilterBar } from "./ScreenerFilterBar";
import { trendingTokens, parseAgeHours } from "@/lib/trending";

export function DexscreenerView() {
  const [tab, setTab] = useState<ScreenerTab>("trending");

  const tokens = useMemo(() => {
    const sorted = [...trendingTokens];
    if (tab === "new") {
      sorted.sort((a, b) => parseAgeHours(a.age) - parseAgeHours(b.age));
    } else if (tab === "top") {
      sorted.sort((a, b) => b.change24h - a.change24h);
    }
    return sorted;
  }, [tab]);

  return (
    <>
      <SectionHeading>Dexscreener</SectionHeading>
      <ScreenerTabs active={tab} onChange={setTab} />
      <ScreenerMetaFilters />
      <ScreenerStats />
      <ScreenerTokenList tokens={tokens} />
      <ScreenerFilterBar />
    </>
  );
}
