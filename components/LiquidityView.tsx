"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useWallet } from "@/app/providers";
import { fetchLivePools, totalTvlEth, totalMyShareEth, type LivePool } from "@/lib/onchainPools";
import { formatToken } from "@/lib/format";
import { KRYVORA_NETWORK } from "@/lib/network";
import { TokenAvatar } from "./TokenAvatar";
import { AddLiquiditySheet } from "./AddLiquiditySheet";

type Tab = "all" | "mine";

export function LiquidityView() {
  const { address } = useWallet();
  const [tab, setTab] = useState<Tab>("all");

  const [pools, setPools] = useState<LivePool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const live = await fetchLivePools(address);
      setPools(live);
    } catch {
      setError("Gagal memuat pool dari Kryvora Network. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  const minePools = pools.filter((p) => p.myLpBalance > BigInt(0));
  const visiblePools = tab === "all" ? pools : minePools;

  const partialTvlCount = pools.filter((p) => p.tvlEth === null).length;

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
          onClick={loadPools}
          disabled={loading}
          aria-label="Muat ulang"
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-surface text-sage transition-colors hover:text-ivory disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.75} />
        </button>
      </div>

      {/* Statistik — dihitung langsung dari reserve pool on-chain, bukan data contoh */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-gold/20 bg-surface px-2.5 py-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-sage">Total TVL</p>
          <p className="mt-1 font-display text-sm text-ivory">
            {formatToken(totalTvlEth(pools))} {KRYVORA_NETWORK.nativeCurrency.symbol}
          </p>
        </div>
        <div className="rounded-xl border border-gold/20 bg-surface px-2.5 py-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-sage">Total Pool</p>
          <p className="mt-1 font-display text-sm text-ivory">{pools.length}</p>
        </div>
        <div className="rounded-xl border border-gold/20 bg-surface px-2.5 py-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-sage">Posisi Saya</p>
          <p className="mt-1 font-display text-sm text-ivory">
            {address ? `${formatToken(totalMyShareEth(pools))} ${KRYVORA_NETWORK.nativeCurrency.symbol}` : "—"}
          </p>
        </div>
      </div>
      {partialTvlCount > 0 && (
        <p className="mt-2 px-1 text-[11px] leading-relaxed text-sage">
          Total TVL & Posisi Saya di atas hanya mencakup pool yang salah satu sisinya{" "}
          {KRYVORA_NETWORK.nativeCurrency.symbol} — {partialTvlCount} pool token-ke-token lain ditampilkan
          terpisah di bawah karena belum ada oracle harga untuk menyatukannya ke satu satuan.
        </p>
      )}

      {/* Tambah Likuiditas — tersambung on-chain ke ThorDexRouter */}
      <div className="mt-5">
        <AddLiquiditySheet open variant="inline" onClose={() => {}} onSuccess={loadPools} />
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

      {/* Daftar pool — dibaca langsung dari ThorDexAMMFactory */}
      <div className="mt-4">
        {error ? (
          <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-danger/30 bg-danger/5 px-4 py-8 text-center">
            <AlertCircle className="h-5 w-5 text-danger" strokeWidth={1.75} />
            <p className="text-xs text-danger">{error}</p>
            <button
              onClick={loadPools}
              className="mt-1 rounded-full border border-gold/20 bg-surface px-3 py-1.5 text-xs text-ivory hover:border-jade/40"
            >
              Coba Lagi
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-gold/15 bg-surface px-4 py-8 text-xs text-sage">
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
            Memuat pool dari {KRYVORA_NETWORK.chainName}…
          </div>
        ) : visiblePools.length === 0 ? (
          <div className="rounded-2xl border border-gold/15 bg-surface px-4 py-8 text-center text-xs text-sage">
            {tab === "mine"
              ? !address
                ? "Hubungkan wallet untuk melihat posisi likuiditas kamu."
                : "Anda belum punya posisi likuiditas. Gunakan formulir Tambah Likuiditas di atas untuk memulai."
              : "Belum ada pool di jaringan ini. Gunakan formulir Tambah Likuiditas di atas untuk membuat pool pertama."}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gold/20">
            {visiblePools.map((pool, i) => {
              const hasEthSide = pool.tvlEth !== null;
              const hasMyPosition = pool.myLpBalance > BigInt(0);
              return (
                <div
                  key={pool.id}
                  className={`flex w-full items-center gap-3 bg-surface px-4 py-3.5 ${
                    i === visiblePools.length - 1 ? "" : "border-b border-gold/10"
                  }`}
                >
                  <div className="flex -space-x-3">
                    <TokenAvatar symbol={pool.tokenA.symbol} address={pool.tokenA.address} size={34} />
                    <TokenAvatar symbol={pool.tokenB.symbol} address={pool.tokenB.address} size={34} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ivory">
                      {pool.tokenA.symbol}/{pool.tokenB.symbol}
                    </p>
                    <p className="truncate font-mono text-xs text-sage">
                      {hasEthSide
                        ? `TVL ${formatToken(pool.tvlEth as number)} ${KRYVORA_NETWORK.nativeCurrency.symbol}`
                        : `${formatToken(
                            Number(pool.reserveA) / 10 ** pool.tokenA.decimals
                          )} ${pool.tokenA.symbol} / ${formatToken(
                            Number(pool.reserveB) / 10 ** pool.tokenB.decimals
                          )} ${pool.tokenB.symbol}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full border border-jade/40 bg-jade/10 px-2 py-0.5 font-mono text-[11px] text-jade-bright">
                      0.3% Fee
                    </span>
                    {hasMyPosition && (
                      <p className="mt-1 font-mono text-[11px] text-sage">
                        Anda:{" "}
                        {hasEthSide
                          ? `${formatToken(pool.myShareEth as number)} ${KRYVORA_NETWORK.nativeCurrency.symbol}`
                          : `${formatToken(pool.myAmountA)} ${pool.tokenA.symbol} + ${formatToken(
                              pool.myAmountB
                            )} ${pool.tokenB.symbol}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
