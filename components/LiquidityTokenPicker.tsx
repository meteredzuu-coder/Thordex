"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Coins, Loader2, X } from "lucide-react";
import { useWallet } from "@/app/providers";
import {
  TOKEN_FACTORY_ADDRESS,
  TOKEN_FACTORY_ABI,
  ERC20_MIN_ABI,
  KRYVORA_NETWORK,
} from "@/lib/contracts";

export type OnChainToken = {
  address: string; // "native" untuk ETH asli, selain itu alamat kontrak ERC20 (lowercase)
  symbol: string;
  name: string;
  decimals: number;
};

export const NATIVE_TOKEN: OnChainToken = {
  address: "native",
  symbol: KRYVORA_NETWORK.nativeCurrency.symbol,
  name: KRYVORA_NETWORK.nativeCurrency.name,
  decimals: 18,
};

type MyToken = { address: string; name: string; symbol: string };

export function LiquidityTokenPicker({
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
  const { address } = useWallet();

  const [pasted, setPasted] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const [myTokens, setMyTokens] = useState<MyToken[]>([]);
  const [loadingMine, setLoadingMine] = useState(false);

  useEffect(() => {
    if (!open) {
      setPasted("");
      setResolveError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !address) return;
    let cancelled = false;
    async function loadMine() {
      setLoadingMine(true);
      try {
        const { JsonRpcProvider, Contract } = await import("ethers");
        const provider = new JsonRpcProvider(KRYVORA_NETWORK.rpcUrls[0]);
        const factory = new Contract(TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI, provider);
        const owned: string[] = await factory.getTokensByCreator(address);
        const results = await Promise.all(
          owned.map(async (tokenAddress): Promise<MyToken> => {
            const token = new Contract(tokenAddress, ERC20_MIN_ABI, provider);
            let name = "Token";
            let symbol = "—";
            try {
              const [n, s] = await Promise.all([token.name(), token.symbol()]);
              name = n;
              symbol = s;
            } catch {
              // biarkan default kalau gagal baca metadata token
            }
            return { address: tokenAddress, name, symbol };
          })
        );
        if (!cancelled) setMyTokens(results.slice().reverse());
      } catch {
        if (!cancelled) setMyTokens([]);
      } finally {
        if (!cancelled) setLoadingMine(false);
      }
    }
    loadMine();
    return () => {
      cancelled = true;
    };
  }, [open, address]);

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
        err?.message?.includes("Alamat kontrak") ? err.message : "Gagal membaca token — pastikan alamat kontrak ERC20 benar dan ada di Kryvora Network."
      );
    } finally {
      setResolving(false);
    }
  }

  function handleSelectMine(t: MyToken) {
    // Asumsi 18 desimal (standar token yang dibuat lewat ThorDexTokenFactory / OpenZeppelin ERC20).
    onSelect({ address: t.address.toLowerCase(), name: t.name, symbol: t.symbol, decimals: 18 });
    onClose();
  }

  const nativeExcluded = excludeAddress === "native";
  const visibleMyTokens = myTokens.filter((t) => t.address.toLowerCase() !== excludeAddress?.toLowerCase());

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
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-obsidian font-display text-xs text-ivory">
                {NATIVE_TOKEN.symbol}
              </span>
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
          </div>

          {/* Token buatan sendiri */}
          <div className="mt-5">
            <p className="flex items-center gap-1.5 px-1 text-xs uppercase tracking-widest text-sage">
              <Coins className="h-3.5 w-3.5" strokeWidth={1.75} />
              Token Kamu
            </p>
            {!address ? (
              <p className="mt-2 px-1 text-xs text-sage">Hubungkan wallet untuk melihat token yang sudah kamu buat.</p>
            ) : loadingMine ? (
              <div className="mt-2 flex items-center gap-2 px-1 text-xs text-sage">
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
                Memuat…
              </div>
            ) : visibleMyTokens.length === 0 ? (
              <p className="mt-2 px-1 text-xs text-sage">Belum ada token yang kamu buat.</p>
            ) : (
              <div className="mt-2 space-y-1">
                {visibleMyTokens.map((t) => (
                  <button
                    key={t.address}
                    onClick={() => handleSelectMine(t)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface2"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-obsidian font-display text-[11px] text-ivory">
                      {t.symbol.slice(0, 3)}
                    </span>
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
