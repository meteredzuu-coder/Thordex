"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { pools, findToken, poolTvlTotal, myLiquidityTotal, type Pool } from "@/lib/pools";
import { formatPrice } from "@/lib/format";
import { KRYVORA_NETWORK } from "@/lib/network";
import { CoinAvatar } from "./CoinAvatar";
import { AddLiquiditySheet } from "./AddLiquiditySheet";

type Tab = "all" | "mine";

export function LiquidityView() {
  const [tab, setTab] = useState<Tab>("all");
  const [activePool, setActivePool] = useState<Pool | null>(null);
  const [newPosition, setNewPosition] = useState(false);

  const visiblePools = tab === "all" ? pools : pools.filter((p) => p.myLiquidityUsd);

  return (
    <div className="px-6 pb-4">
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ivory">Liquidity</h1>
          <p className="mt-1 text-sm text-sage">
            Sediakan likuiditas di {KRYVORA_NETWORK.chainName} dan dapatkan bagian dari biaya swap
          </p>
        </div>
        <button
          onClick={() => setNewPosition(true)}
          aria-label="Tambah posisi likuiditas baru"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-emerald-deep text-gold transition-colors hover:border-jade/50"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Statistik */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-gold/20 bg-surface px-2.5 py-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-sage">Total TVL</p>
          <p className="mt-1 font-display text-sm text-ivory">{formatPrice(poolTvlTotal())}</p>
        </div>
        <div className="rounded-xl border border-gold/20 bg-surface px-2.5 py-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-sage">Total Pool</p>
          <p className="mt-1 font-display text-sm text-ivory">{pools.length}</p>
        </div>
        <div className="rounded-xl border border-gold/20 bg-surface px-2.5 py-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-sage">Posisi Saya</p>
          <p className="mt-1 font-display text-sm text-ivory">{formatPrice(myLiquidityTotal())}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 inline-flex rounded-full border border-gold/20 bg-surface p-1">
        <button
          onClick={() => setTab("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            tab === "all" ? "bg-jade/20 text-jade-bright" : "text-sage hover:text-ivory"
          }`}
        >
          Semua Pool
        </button>
        <button
          onClick={() => setTab("mine")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            tab === "mine" ? "bg-jade/20 text-jade-bright" : "text-sage hover:text-ivory"
          }`}
        >
          Posisi Saya
        </button>
      </div>

      {/* Daftar pool */}
      <div className="mt-4">
        {visiblePools.length === 0 ? (
          <div className="rounded-2xl border border-gold/15 bg-surface px-4 py-8 text-center text-xs text-sage">
            Anda belum punya posisi likuiditas. Ketuk tombol + untuk memulai.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gold/20">
            {visiblePools.map((pool, i) => {
              const tokenA = findToken(pool.tokenAId);
              const tokenB = findToken(pool.tokenBId);
              return (
                <button
                  key={pool.id}
                  onClick={() => setActivePool(pool)}
                  className={`flex w-full items-center gap-3 bg-surface px-4 py-3.5 text-left transition-colors hover:bg-surface2 ${
                    i === visiblePools.length - 1 ? "" : "border-b border-gold/10"
                  }`}
                >
                  <div className="flex -space-x-3">
                    <CoinAvatar coin={tokenA} size={34} />
                    <CoinAvatar coin={tokenB} size={34} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ivory">
                      {tokenA.symbol}/{tokenB.symbol}
                    </p>
                    <p className="font-mono text-xs text-sage">TVL {formatPrice(pool.tvl)}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full border border-jade/40 bg-jade/10 px-2 py-0.5 font-mono text-[11px] text-jade-bright">
                      {pool.apr}% APR
                    </span>
                    {pool.myLiquidityUsd && (
                      <p className="mt-1 font-mono text-[11px] text-sage">Anda: {formatPrice(pool.myLiquidityUsd)}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <p className="mt-3 px-1 text-[11px] leading-relaxed text-sage">
          Data pool masih contoh (mock) — akan tersambung ke likuiditas on-chain asli saat backend siap.
        </p>
      </div>

      {activePool && (
        <AddLiquiditySheet
          open
          tokenAId={activePool.tokenAId}
          tokenBId={activePool.tokenBId}
          poolTvl={activePool.tvl}
          onClose={() => setActivePool(null)}
        />
      )}

      {newPosition && (
        <AddLiquiditySheet
          open
          tokenAId="native"
          tokenBId="thor"
          poolTvl={0}
          onClose={() => setNewPosition(false)}
        />
      )}
    </div>
  );
}
