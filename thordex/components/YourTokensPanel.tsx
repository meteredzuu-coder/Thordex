"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Coins, Droplets, ExternalLink, RefreshCw } from "lucide-react";
import { useWallet } from "@/app/providers";
import {
  TOKEN_FACTORY_ADDRESS,
  TOKEN_FACTORY_ABI,
  AMM_FACTORY_ADDRESS,
  AMM_FACTORY_ABI,
  PAIR_ABI,
  ERC20_MIN_ABI,
  WKRY_ADDRESS,
  KRYVORA_NETWORK,
  explorerAddressUrl,
} from "@/lib/contracts";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

type MyToken = {
  address: string;
  name: string;
  symbol: string;
  liquidity: string | null; // null = belum ada liquidity, string = jumlah token liquidity terformat
};

function shorten(value: string, head = 6, tail = 4) {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function YourTokensPanel() {
  const { address, connect, connecting } = useWallet();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tokens, setTokens] = useState<MyToken[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const { JsonRpcProvider, Contract, formatUnits } = await import("ethers");
      const provider = new JsonRpcProvider(KRYVORA_NETWORK.rpcUrls[0]);
      const factory = new Contract(TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI, provider);
      const ammFactory = new Contract(AMM_FACTORY_ADDRESS, AMM_FACTORY_ABI, provider);

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

          let liquidity: string | null = null;
          try {
            const pairAddress: string = await ammFactory.getPair(tokenAddress, WKRY_ADDRESS);
            if (pairAddress && pairAddress.toLowerCase() !== ZERO_ADDRESS) {
              const pair = new Contract(pairAddress, PAIR_ABI, provider);
              const [token0, reserves] = await Promise.all([pair.token0(), pair.getReserves()]);
              const isToken0 = (token0 as string).toLowerCase() === tokenAddress.toLowerCase();
              const reserve: bigint = isToken0 ? reserves[0] : reserves[1];
              if (reserve > BigInt(0)) {
                liquidity = Number(formatUnits(reserve, 18)).toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                });
              }
            }
          } catch {
            // gagal baca pool/liquidity, anggap belum ada liquidity
          }

          return { address: tokenAddress, name, symbol, liquidity };
        })
      );

      setTokens(results.slice().reverse());
      setLoaded(true);
    } catch {
      setError("Gagal memuat token kamu. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (open && address && !loaded && !loading) {
      loadTokens();
    }
  }, [open, address, loaded, loading, loadTokens]);

  useEffect(() => {
    // reset cache kalau wallet ganti akun
    setLoaded(false);
    setTokens([]);
  }, [address]);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gold/20 bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <Coins className="h-4 w-4 shrink-0 text-sage" strokeWidth={1.75} />
        <span className="flex-1 text-sm text-ivory">Your Token</span>
        {tokens.length > 0 && (
          <span className="shrink-0 rounded-full border border-jade/40 bg-jade/10 px-2 py-0.5 text-[10px] font-medium text-jade-bright">
            {tokens.length}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 shrink-0 text-sage transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-gold/10 px-4 pb-4 pt-3">
          {!address ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-xs text-sage">Hubungkan wallet untuk melihat token yang sudah kamu buat.</p>
              <button
                type="button"
                onClick={connect}
                disabled={connecting}
                className="rounded-full border border-jade/40 bg-jade/10 px-4 py-1.5 text-xs font-semibold text-jade-bright transition-colors hover:bg-jade/20 disabled:opacity-60"
              >
                {connecting ? "Menghubungkan…" : "Connect Wallet"}
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-sage">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
              Memuat token kamu…
            </div>
          ) : error ? (
            <div className="py-4 text-center text-xs text-danger">{error}</div>
          ) : tokens.length === 0 ? (
            <div className="py-4 text-center text-xs text-sage">Kamu belum membuat token apa pun.</div>
          ) : (
            <div className="space-y-2">
              {tokens.map((t) => (
                <a
                  key={t.address}
                  href={explorerAddressUrl(t.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-gold/15 bg-obsidian px-3.5 py-2.5 transition-colors hover:border-jade/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ivory">{t.name}</p>
                    <p className="flex items-center gap-1 truncate font-mono text-[11px] text-sage">
                      {t.symbol} • {shorten(t.address)}
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" strokeWidth={1.75} />
                    </p>
                  </div>
                  {t.liquidity ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-jade/40 bg-jade/10 px-2 py-0.5 font-mono text-[11px] text-jade-bright">
                      <Droplets className="h-3 w-3" strokeWidth={1.75} />
                      {t.liquidity}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full border border-sage/30 bg-sage/10 px-2 py-0.5 text-[11px] text-sage">
                      Tidak ada liquidity
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}

          {address && !loading && (
            <button
              type="button"
              onClick={loadTokens}
              className="mt-3 flex items-center gap-1.5 text-[11px] text-sage transition-colors hover:text-jade-bright"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.75} />
              Muat ulang
            </button>
          )}
        </div>
      )}
    </div>
  );
}
