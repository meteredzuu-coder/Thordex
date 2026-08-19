"use client";

import { useState } from "react";
import { pools, findToken, poolTvlTotal, myLiquidityTotal } from "@/lib/pools";
import { formatPrice } from "@/lib/format";
import { KRYVORA_NETWORK } from "@/lib/network";
import { CoinAvatar } from "./CoinAvatar";
import { AddLiquiditySheet } from "./AddLiquiditySheet";

type Tab = "all" | "mine";

export function LiquidityView() {
  const [tab, setTab] = useState<Tab>("all");

  const visiblePools = tab === "all" ? pools : pools.filter((p) => p.myLiquidityUsd);

  return (
    <div className="px-6 pb-4">
      <div className="mt-2">
        <h1 className="font-display text-2xl text-ivory">Liquidity</h1>
        <p className="mt-1 text-sm text-sage">
          Sediakan likuiditas di {KRYVORA_NETWORK.chainName} dan dapatkan bagian dari biaya swap
        </p>
      </div>

      {/* Statistik (contoh/mock — ringkasan pool asli butuh indexer terpisah) */}
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

      {/* Tambah Likuiditas — sudah tersambung on-chain ke ThorDexRouter */}
      <div className="mt-5">
        <AddLiquiditySheet open variant="inline" onClose={() => {}} />
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

      {/* Daftar pool (contoh/mock, tampilan saja) */}
      <div className="mt-4">
        {visiblePools.length === 0 ? (
          <div className="rounded-2xl border border-gold/15 bg-surface px-4 py-8 text-center text-xs text-sage">
            Anda belum punya posisi likuiditas. Gunakan formulir Tambah Likuiditas di atas untuk memulai.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gold/20">
            {visiblePools.map((pool, i) => {
              const tokenA = findToken(pool.tokenAId);
              const tokenB = findToken(pool.tokenBId);
              return (
                <div
                  key={pool.id}
                  className={`flex w-full items-center gap-3 bg-surface px-4 py-3.5 ${
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
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-3 px-1 text-[11px] leading-relaxed text-sage">
          Daftar pool di atas masih data contoh (mock) untuk tampilan. Gunakan formulir Tambah
          Likuiditas di atas untuk berinteraksi dengan pool on-chain yang sesungguhnya.
        </p>
      </div>
    </div>
  );
}
