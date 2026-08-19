"use client";

import { useState } from "react";
import { Search, X, Check } from "lucide-react";
import type { Coin } from "@/lib/coins";
import { CoinAvatar } from "./CoinAvatar";

export function TokenSelectModal({
  open,
  tokens,
  selectedId,
  excludeId,
  onSelect,
  onClose,
}: {
  open: boolean;
  tokens: Coin[];
  selectedId?: string;
  excludeId?: string;
  onSelect: (token: Coin) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  const filtered = tokens.filter((t) => {
    if (t.id === excludeId) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[75vh] w-full max-w-[560px] flex-col rounded-t-3xl border-t border-gold/25 bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between px-6 pt-5">
          <h3 className="font-display text-lg text-ivory">Pilih Token</h3>
          <button onClick={onClose} aria-label="Tutup" className="text-sage hover:text-ivory">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-obsidian px-3.5 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-sage" strokeWidth={1.75} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau simbol token"
              className="w-full bg-transparent text-sm text-ivory placeholder:text-sage/50 outline-none"
            />
          </div>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto px-3 pb-6">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-sage">Token tidak ditemukan.</p>
          ) : (
            filtered.map((token) => {
              const active = token.id === selectedId;
              return (
                <button
                  key={token.id}
                  onClick={() => {
                    onSelect(token);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    active ? "bg-emerald-deep" : "hover:bg-surface2"
                  }`}
                >
                  <CoinAvatar coin={token} size={38} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ivory">{token.symbol}</p>
                    <p className="text-xs text-sage">{token.name}</p>
                  </div>
                  {active && <Check className="h-4 w-4 shrink-0 text-jade-bright" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
