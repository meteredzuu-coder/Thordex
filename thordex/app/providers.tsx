"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ComingSoonModal } from "@/components/ComingSoonModal";
import { ensureKryvoraNetwork } from "@/lib/network";

type ComingSoonContextType = {
  openComingSoon: (label: string) => void;
};

const ComingSoonContext = createContext<ComingSoonContextType | null>(null);

export function useComingSoon() {
  const ctx = useContext(ComingSoonContext);
  if (!ctx) {
    throw new Error("useComingSoon harus dipakai di dalam AppProviders");
  }
  return ctx;
}

type WalletContextType = {
  address: string | null;
  balance: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet harus dipakai di dalam AppProviders");
  }
  return ctx;
}

// Ubah saldo hex (wei) dari provider menjadi string ETH yang mudah dibaca.
// Pakai BigInt() sebagai fungsi (bukan literal 123n) karena target TS project ini ES2017.
const WEI_PER_ETH = BigInt("1000000000000000000");

function weiHexToEth(hexWei: string): string {
  try {
    const wei = BigInt(hexWei);
    const whole = wei / WEI_PER_ETH;
    const frac = wei % WEI_PER_ETH;
    const fracStr = frac.toString().padStart(18, "0").slice(0, 4);
    return `${whole}.${fracStr}`;
  } catch {
    return "0.0000";
  }
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);

  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async (provider: any, addr: string) => {
    try {
      const hex: string = await provider.request({
        method: "eth_getBalance",
        params: [addr, "latest"],
      });
      setBalance(weiHexToEth(hex));
    } catch {
      setBalance(null);
    }
  }, []);

  const connect = useCallback(async () => {
    const provider = (window as any).ethereum;

    if (!provider) {
      setError("Wallet tidak terdeteksi");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
      await ensureKryvoraNetwork(provider);
      const acc = accounts[0] ?? null;
      setAddress(acc);
      if (acc) await fetchBalance(provider, acc);
    } catch {
      setError("Gagal terhubung");
    } finally {
      setConnecting(false);
    }
  }, [fetchBalance]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
  }, []);

  // Ikuti perubahan akun dari wallet (mis. user ganti akun di MetaMask).
  useEffect(() => {
    const provider = (window as any).ethereum;
    if (!provider?.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      const acc = accounts[0] ?? null;
      setAddress(acc);
      if (acc) fetchBalance(provider, acc);
      else setBalance(null);
    };

    provider.on("accountsChanged", handleAccountsChanged);
    return () => provider.removeListener?.("accountsChanged", handleAccountsChanged);
  }, [fetchBalance]);

  return (
    <ComingSoonContext.Provider value={{ openComingSoon: setLabel }}>
      <WalletContext.Provider value={{ address, balance, connecting, error, connect, disconnect }}>
        {children}
        <ComingSoonModal label={label} onClose={() => setLabel(null)} />
      </WalletContext.Provider>
    </ComingSoonContext.Provider>
  );
}
