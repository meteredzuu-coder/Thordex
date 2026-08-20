"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Droplets, Loader2, X } from "lucide-react";
import { fetchLivePools } from "@/lib/onchainPools";
import { ERC20_MIN_ABI, KRYVORA_NETWORK } from "@/lib/contracts";
import { TokenAvatar } from "./TokenAvatar";
import { NATIVE_TOKEN, type OnChainToken } from "./LiquidityTokenPicker";

// Token dengan pool aktif, dikumpulkan dari semua pair on-chain (dedup by address).
async function loadPooledTokens(): Promise<OnChainToken[]> {
  const pools = await fetchLivePools();
  const map = new Map<string, OnChainToken>();
  for (const pool of pools) {
    for (const t of [pool.tokenA, pool.tokenB]) {
      if (t.isNative) continue; // ETH native ditampilkan terpisah, bukan sebagai WKRY
      if (!map.has(t.address)) {
        map.set(t.address, { address: t.address, symbol: t.symbol, name: t.name, decimals: t.decimals });
      }
    }
  }
  return Array.from(map.values());
}

export function SwapTokenPicker({
  open,
  excludeAddress,
  onSelect,
  onClose,
}: {
  open: boolean;
  excludeAddress?: string;
  onSelect: (token: OnChainToken) => void;
  onClose: () => void;
}) {
  const [pasted, setPasted] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const [pooledTokens, setPooledTokens] = useState<OnChainToken[]>([]);
  const [loadingPools, setLoadingPools] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!open) {
      setPasted("");
      setResolveError(null);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoadingPools(true);
      setLoadError(false);
      try {
        const tokens = await loadPooledTokens();
        if (!cancelled) setPooledTokens(tokens);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoadingPools(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  async function handleUsePasted() {
    const value = pasted.trim();
    setResolveError(null);
    if (!value) return;
    if (value.toLowerCase() === excludeAddress?.toLowerCase()) {
      setResolveError("Token ini sudah dipilih di sisi lain.");
      return;
    }

    setResolving(true);
    try {
      const { JsonRpcProvider, Contract, isAddress } = await import("ethers");
      if (!isAddress(value)) throw new Error("Alamat kontrak tidak valid.");
      const provider = new JsonRpcProvider(KRYVORA_NETWORK.rpcUrls[0]);
      const token = new Contract(value, ERC20_MIN_ABI, provider);
      const [name, symbol, decimals] = await Promise.all([token.name(), token.symbol(), token.decimals()]);
      onSelect({ address: value.toLowerCase(), name, symbol, decimals: Number(decimals) });
      onClose();
    } catch (err: any) {
      setResolveError(
        err?.message?.includes("Alamat kontrak")
          ? err.message
          : "Gagal membaca token — pastikan alamat kontrak ERC20 benar dan ada di Kryvora Network."
      );
    } finally {
      setResolving(false);
    }
  }

  const nativeExcluded = excludeAddress === "native";
  const visiblePooled = pooledTokens.filter((t) => t.address.toLowerCase() !== excludeAddress?.toLowerCase());

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[80vh] w-full max-w-[560px] flex-col rounded-t-3xl border-t border-gold/25 bg-surface pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="flex items-center justify-between px-6 pt-5">
          <h3 className="font-display text-lg text-ivory">Pilih Token</h3>
          <button onClick={onClose} aria-label="Tutup" className="text-sage hover:text-ivory">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-6 pb-6">
          {/* Native ETH */}
          {!nativeExcluded && (
            <button
              onClick={() => {
                onSelect(NATIVE_TOKEN);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface2"
            >
              <TokenAvatar symbol={NATIVE_TOKEN.symbol} address="native" size={36} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ivory">{NATIVE_TOKEN.symbol}</p>
                <p className="text-xs text-sage">{NATIVE_TOKEN.name} (native)</p>
              </div>
            </button>
          )}

          {/* Tempel alamat kontrak */}
          <div className="mt-4 rounded-xl border border-gold/20 bg-obsidian p-3.5">
            <p className="text-xs uppercase tracking-widest text-sage">Tempel Alamat Token</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder="0x..."
                className="w-full min-w-0 rounded-lg border border-gold/20 bg-surface px-3 py-2 font-mono text-xs text-ivory placeholder:text-sage/50 outline-none focus:border-jade/50"
              />
              <button
                onClick={handleUsePasted}
                disabled={resolving || !pasted.trim()}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-jade/20 px-3 py-2 text-xs font-semibold text-jade-bright transition-colors hover:bg-jade/30 disabled:opacity-50"
              >
                {resolving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Gunakan
              </button>
            </div>
            {resolveError && (
              <p className="mt-2 flex items-start gap-1.5 text-[11px] text-danger">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                {resolveError}
              </p>
            )}
            <p className="mt-2 text-[11px] text-sage">
              Token yang ditempel manual hanya bisa di-swap kalau sudah punya pool likuiditas.
            </p>
          </div>

          {/* Token dengan pool aktif */}
          <div className="mt-5">
            <p className="flex items-center gap-1.5 px-1 text-xs uppercase tracking-widest text-sage">
              <Droplets className="h-3.5 w-3.5" strokeWidth={1.75} />
              Token dengan Pool
            </p>
            {loadingPools ? (
              <div className="mt-2 flex items-center gap-2 px-1 text-xs text-sage">
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
                Memuat…
              </div>
            ) : loadError ? (
              <p className="mt-2 px-1 text-xs text-sage">Gagal memuat daftar pool. Coba tutup dan buka lagi.</p>
            ) : visiblePooled.length === 0 ? (
              <p className="mt-2 px-1 text-xs text-sage">Belum ada pool token lain selain ETH di jaringan ini.</p>
            ) : (
              <div className="mt-2 space-y-1">
                {visiblePooled.map((t) => (
                  <button
                    key={t.address}
                    onClick={() => {
                      onSelect(t);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface2"
                  >
                    <TokenAvatar symbol={t.symbol} address={t.address} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ivory">{t.symbol}</p>
                      <p className="truncate text-xs text-sage">{t.name}</p>
                    </div>
                    <Check className="h-4 w-4 shrink-0 text-jade-bright opacity-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
