"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { coins } from "@/lib/coins";
import { formatChange, formatPrice } from "@/lib/format";
import { CoinAvatar } from "./CoinAvatar";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coins;
    return coins.filter(
      (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] bg-obsidian" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full max-w-[560px] flex-col px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-gold/30 bg-surface px-4 py-2.5">
            <Search className="h-4 w-4 text-gold" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau simbol koin..."
              className="w-full bg-transparent text-sm text-ivory placeholder:text-sage focus:outline-none"
            />
          </div>
          <button aria-label="Tutup pencarian" onClick={onClose} className="text-sage hover:text-ivory">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto">
          {results.length === 0 ? (
            <p className="mt-10 text-center text-sm text-sage">Tidak ada koin yang cocok.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-gold/10">
              {results.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <CoinAvatar coin={c} size={38} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ivory">{c.name}</p>
                    <p className="text-xs text-sage">{c.symbol}</p>
                  </div>
                  <div className="text-right font-mono text-sm">
                    <p className="text-ivory">{formatPrice(c.price)}</p>
                    <p className={c.change24h >= 0 ? "text-jade" : "text-danger"}>
                      {formatChange(c.change24h)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
