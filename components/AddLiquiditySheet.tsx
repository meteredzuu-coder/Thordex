"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ChevronDown, Droplets, ExternalLink, Loader2, Plus, Wallet as WalletIcon, X } from "lucide-react";
import { useWallet } from "@/app/providers";
import {
  AMM_FACTORY_ADDRESS,
  AMM_FACTORY_ABI,
  ERC20_MIN_ABI,
  PAIR_ABI,
  ROUTER_ADDRESS,
  ROUTER_ABI,
  WKRY_ADDRESS,
  KRYVORA_NETWORK,
  ZERO_ADDRESS,
  explorerTxUrl,
} from "@/lib/contracts";
import { LiquidityTokenPicker, NATIVE_TOKEN, type OnChainToken } from "./LiquidityTokenPicker";

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0];
const DEADLINE_MINUTES = 20;

function addressOf(token: OnChainToken): string {
  return token.address === "native" ? WKRY_ADDRESS : token.address;
}

function formatAmount(value: number): string {
  if (!value) return "";
  return value.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

function humanizeError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("user rejected") || msg.includes("user denied") || msg.includes("action_rejected")) {
    return "Transaksi dibatalkan di wallet.";
  }
  if (msg.includes("insufficient funds")) return "Saldo tidak cukup untuk transaksi + gas.";
  if (msg.includes("insufficient a amount") || msg.includes("insufficient b amount")) {
    return "Rate pool berubah saat transaksi diproses — coba lagi.";
  }
  if (msg.includes("expired")) return "Transaksi kedaluwarsa, coba lagi.";
  if (msg.includes("wallet tidak terdeteksi")) return raw;
  return raw.length > 140 ? "Terjadi kesalahan saat menambah likuiditas. Coba lagi." : raw;
}

export function AddLiquiditySheet({
  open,
  onClose,
  variant = "modal",
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  variant?: "modal" | "inline";
  onSuccess?: () => void;
}) {
  const { address, balance: nativeBalance, connect, connecting } = useWallet();

  const [tokenA, setTokenA] = useState<OnChainToken>(NATIVE_TOKEN);
  const [tokenB, setTokenB] = useState<OnChainToken | null>(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [selecting, setSelecting] = useState<"a" | "b" | null>(null);
  const [slippage, setSlippage] = useState(0.5);

  const [balanceA, setBalanceA] = useState<number | null>(null);
  const [balanceB, setBalanceB] = useState<number | null>(null);

  const [pairExists, setPairExists] = useState(false);
  const [reserveA, setReserveA] = useState<bigint>(BigInt(0));
  const [reserveB, setReserveB] = useState<bigint>(BigInt(0));
  const [loadingPair, setLoadingPair] = useState(false);

  const [stage, setStage] = useState<"idle" | "approving" | "confirming" | "mining">("idle");
  const [approvingSymbol, setApprovingSymbol] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Ambil saldo Token A & B setiap kali token/wallet berubah.
  useEffect(() => {
    let cancelled = false;
    async function loadBalances() {
      if (!address) {
        setBalanceA(null);
        setBalanceB(null);
        return;
      }
      const { JsonRpcProvider, Contract, formatUnits } = await import("ethers");
      const provider = new JsonRpcProvider(KRYVORA_NETWORK.rpcUrls[0]);

      if (tokenA.address === "native") {
        setBalanceA(parseFloat(nativeBalance ?? "0"));
      } else {
        try {
          const token = new Contract(tokenA.address, ERC20_MIN_ABI, provider);
          const raw: bigint = await token.balanceOf(address);
          if (!cancelled) setBalanceA(Number(formatUnits(raw, tokenA.decimals)));
        } catch {
          if (!cancelled) setBalanceA(0);
        }
      }

      if (!tokenB) {
        setBalanceB(null);
      } else if (tokenB.address === "native") {
        setBalanceB(parseFloat(nativeBalance ?? "0"));
      } else {
        try {
          const token = new Contract(tokenB.address, ERC20_MIN_ABI, provider);
          const raw: bigint = await token.balanceOf(address);
          if (!cancelled) setBalanceB(Number(formatUnits(raw, tokenB.decimals)));
        } catch {
          if (!cancelled) setBalanceB(0);
        }
      }
    }
    loadBalances();
    return () => {
      cancelled = true;
    };
  }, [address, tokenA, tokenB, nativeBalance]);

  // Cek apakah pool untuk pasangan ini sudah ada, dan ambil reserve-nya (untuk rasio otomatis).
  useEffect(() => {
    let cancelled = false;
    async function loadPair() {
      if (!tokenB) {
        setPairExists(false);
        setReserveA(BigInt(0));
        setReserveB(BigInt(0));
        return;
      }
      setLoadingPair(true);
      try {
        const { JsonRpcProvider, Contract } = await import("ethers");
        const provider = new JsonRpcProvider(KRYVORA_NETWORK.rpcUrls[0]);
        const ammFactory = new Contract(AMM_FACTORY_ADDRESS, AMM_FACTORY_ABI, provider);
        const addrA = addressOf(tokenA);
        const addrB = addressOf(tokenB);
        const pairAddress: string = await ammFactory.getPair(addrA, addrB);

        if (!pairAddress || pairAddress.toLowerCase() === ZERO_ADDRESS) {
          if (!cancelled) {
            setPairExists(false);
            setReserveA(BigInt(0));
            setReserveB(BigInt(0));
          }
          return;
        }

        const pair = new Contract(pairAddress, PAIR_ABI, provider);
        const [token0, reserves] = await Promise.all([pair.token0(), pair.getReserves()]);
        const isAToken0 = (token0 as string).toLowerCase() === addrA.toLowerCase();
        if (!cancelled) {
          setPairExists(true);
          setReserveA(isAToken0 ? reserves[0] : reserves[1]);
          setReserveB(isAToken0 ? reserves[1] : reserves[0]);
        }
      } catch {
        if (!cancelled) {
          setPairExists(false);
          setReserveA(BigInt(0));
          setReserveB(BigInt(0));
        }
      } finally {
        if (!cancelled) setLoadingPair(false);
      }
    }
    loadPair();
    return () => {
      cancelled = true;
    };
  }, [tokenA, tokenB]);

  if (variant === "modal" && !open) return null;

  async function handleAmountAChange(v: string) {
    if (!/^\d*\.?\d*$/.test(v)) return;
    setAmountA(v);
    if (!tokenB || !pairExists || reserveA === BigInt(0)) {
      return;
    }
    const num = parseFloat(v) || 0;
    if (num <= 0) {
      setAmountB("");
      return;
    }
    const { parseUnits, formatUnits } = await import("ethers");
    try {
      const rawA = parseUnits(v, tokenA.decimals);
      const rawB = (rawA * reserveB) / reserveA;
      setAmountB(Number(formatUnits(rawB, tokenB.decimals)).toLocaleString("en-US", { maximumFractionDigits: 6 }));
    } catch {
      // biarkan input apa adanya kalau parsing gagal (mis. masih mengetik "0.")
    }
  }

  async function handleAmountBChange(v: string) {
    if (!/^\d*\.?\d*$/.test(v)) return;
    setAmountB(v);
    if (!tokenB || !pairExists || reserveB === BigInt(0)) {
      return;
    }
    const num = parseFloat(v) || 0;
    if (num <= 0) {
      setAmountA("");
      return;
    }
    const { parseUnits, formatUnits } = await import("ethers");
    try {
      const rawB = parseUnits(v, tokenB.decimals);
      const rawA = (rawB * reserveA) / reserveB;
      setAmountA(Number(formatUnits(rawA, tokenA.decimals)).toLocaleString("en-US", { maximumFractionDigits: 6 }));
    } catch {
      // biarkan input apa adanya
    }
  }

  function handleSelect(token: OnChainToken) {
    if (selecting === "a") {
      if (tokenB && token.address === tokenB.address) setTokenB(tokenA);
      setTokenA(token);
    } else if (selecting === "b") {
      if (token.address === tokenA.address) {
        setTokenA(tokenB ?? NATIVE_TOKEN);
      }
      setTokenB(token);
    }
    setAmountA("");
    setAmountB("");
    setErrorMsg(null);
    setTxHash(null);
  }

  const amountANum = parseFloat(amountA) || 0;
  const amountBNum = parseFloat(amountB) || 0;

  const insufficientA = address && balanceA !== null ? amountANum > balanceA : false;
  const insufficientB = address && balanceB !== null ? amountBNum > balanceB : false;

  const bothNative = tokenB ? tokenA.address === "native" && tokenB.address === "native" : false;

  let ctaLabel = "Tambah Likuiditas";
  if (!address) ctaLabel = "Connect Wallet";
  else if (!tokenB) ctaLabel = "Pilih Token";
  else if (bothNative) ctaLabel = "Token Tidak Boleh Sama";
  else if (amountANum <= 0 || amountBNum <= 0) ctaLabel = "Masukkan Jumlah";
  else if (insufficientA) ctaLabel = `Saldo ${tokenA.symbol} Tidak Cukup`;
  else if (insufficientB) ctaLabel = `Saldo ${tokenB.symbol} Tidak Cukup`;
  else if (!pairExists) ctaLabel = "Buat Pool & Tambah Likuiditas";

  const ctaDisabled = Boolean(address) &&
    (!tokenB || bothNative || amountANum <= 0 || amountBNum <= 0 || insufficientA || insufficientB);

  const processing = stage !== "idle";

  async function handleCta() {
    if (!address) {
      connect();
      return;
    }
    if (ctaDisabled || !tokenB || processing) return;

    setErrorMsg(null);
    setTxHash(null);

    try {
      const { BrowserProvider, Contract, parseUnits } = await import("ethers");
      const browserProvider = new BrowserProvider((window as any).ethereum);
      const signer = await browserProvider.getSigner();
      const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

      const deadline = Math.floor(Date.now() / 1000) + DEADLINE_MINUTES * 60;
      const slippageFactor = 1 - slippage / 100;

      const rawA = parseUnits(amountA, tokenA.decimals);
      const rawB = parseUnits(amountB, tokenB.decimals);
      const rawAMin = pairExists
        ? (rawA * BigInt(Math.round(slippageFactor * 10000))) / BigInt(10000)
        : BigInt(0);
      const rawBMin = pairExists
        ? (rawB * BigInt(Math.round(slippageFactor * 10000))) / BigInt(10000)
        : BigInt(0);

      const isNativePair = tokenA.address === "native" || tokenB.address === "native";

      if (isNativePair) {
        const ercToken = tokenA.address === "native" ? tokenB : tokenA;
        const ercAmount = tokenA.address === "native" ? rawB : rawA;
        const ercAmountMin = tokenA.address === "native" ? rawBMin : rawAMin;
        const ethAmount = tokenA.address === "native" ? rawA : rawB;
        const ethAmountMin = tokenA.address === "native" ? rawAMin : rawBMin;

        setApprovingSymbol(ercToken.symbol);
        setStage("approving");
        const erc20 = new Contract(ercToken.address, ERC20_MIN_ABI, signer);
        const currentAllowance: bigint = await erc20.allowance(address, ROUTER_ADDRESS);
        if (currentAllowance < ercAmount) {
          const approveTx = await erc20.approve(ROUTER_ADDRESS, ercAmount);
          await approveTx.wait();
        }

        setStage("confirming");
        const tx = await router.addLiquidityETH(
          ercToken.address,
          ercAmount,
          ercAmountMin,
          ethAmountMin,
          address,
          deadline,
          { value: ethAmount }
        );

        setStage("mining");
        const receipt = await tx.wait();
        setTxHash(receipt.hash);
        onSuccess?.();
      } else {
        setApprovingSymbol(tokenA.symbol);
        setStage("approving");
        const erc20A = new Contract(tokenA.address, ERC20_MIN_ABI, signer);
        const allowanceA: bigint = await erc20A.allowance(address, ROUTER_ADDRESS);
        if (allowanceA < rawA) {
          const approveTxA = await erc20A.approve(ROUTER_ADDRESS, rawA);
          await approveTxA.wait();
        }

        setApprovingSymbol(tokenB.symbol);
        setStage("approving");
        const erc20B = new Contract(tokenB.address, ERC20_MIN_ABI, signer);
        const allowanceB: bigint = await erc20B.allowance(address, ROUTER_ADDRESS);
        if (allowanceB < rawB) {
          const approveTxB = await erc20B.approve(ROUTER_ADDRESS, rawB);
          await approveTxB.wait();
        }

        setStage("confirming");
        const tx = await router.addLiquidity(
          tokenA.address,
          tokenB.address,
          rawA,
          rawB,
          rawAMin,
          rawBMin,
          address,
          deadline
        );

        setStage("mining");
        const receipt = await tx.wait();
        setTxHash(receipt.hash);
        onSuccess?.();
      }

      setAmountA("");
      setAmountB("");
    } catch (err: any) {
      const raw = err?.reason || err?.shortMessage || err?.info?.error?.message || err?.message || String(err);
      setErrorMsg(humanizeError(raw));
    } finally {
      setStage("idle");
    }
  }

  function handleClose() {
    setAmountA("");
    setAmountB("");
    setErrorMsg(null);
    onClose();
  }

  function stageLabel(): string {
    if (stage === "approving") return `Approve ${approvingSymbol ?? ""}…`;
    if (stage === "confirming") return "Konfirmasi di wallet…";
    if (stage === "mining") return "Memproses transaksi…";
    return ctaLabel;
  }

  const formContent = (
    <>
      {/* Token A */}
      <div className="mt-5 rounded-2xl border border-gold/20 bg-obsidian p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-sage">Token 1</span>
          {address && balanceA !== null && (
            <span className="text-[11px] text-sage">Saldo: {formatAmount(balanceA)}</span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            value={amountA}
            onChange={(e) => handleAmountAChange(e.target.value)}
            inputMode="decimal"
            placeholder="0.0"
            className="w-full min-w-0 bg-transparent font-display text-2xl text-ivory placeholder:text-sage/40 outline-none"
          />
          <button
            onClick={() => setSelecting("a")}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-surface py-1.5 pl-3 pr-3 transition-colors hover:border-jade/40"
          >
            <span className="text-sm font-semibold text-ivory">{tokenA.symbol}</span>
            <ChevronDown className="h-3.5 w-3.5 text-sage" />
          </button>
        </div>
      </div>

      {/* Plus icon */}
      <div className="relative z-10 -my-3 flex justify-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-emerald-deep text-gold">
          <Plus className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>

      {/* Token B */}
      <div className="rounded-2xl border border-gold/20 bg-obsidian p-4 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-sage">Token 2</span>
          {address && tokenB && balanceB !== null && (
            <span className="text-[11px] text-sage">Saldo: {formatAmount(balanceB)}</span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            value={amountB}
            onChange={(e) => handleAmountBChange(e.target.value)}
            inputMode="decimal"
            placeholder="0.0"
            className="w-full min-w-0 bg-transparent font-display text-2xl text-ivory placeholder:text-sage/40 outline-none"
          />
          <button
            onClick={() => setSelecting("b")}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-surface py-1.5 pl-3 pr-3 transition-colors hover:border-jade/40"
          >
            <span className="text-sm font-semibold text-ivory">{tokenB ? tokenB.symbol : "Pilih token"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-sage" />
          </button>
        </div>
      </div>

      {/* Info pool */}
      <div className="mt-4 space-y-2.5 rounded-xl border border-gold/15 bg-obsidian px-4 py-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-sage">Status Pool</span>
          <span className="font-mono text-ivory">
            {!tokenB ? "—" : loadingPair ? "Memuat…" : pairExists ? "Sudah ada" : "Belum ada (akan dibuat)"}
          </span>
        </div>
        {tokenB && pairExists && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-sage">Slippage Tolerance</span>
            <div className="flex gap-1.5">
              {SLIPPAGE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSlippage(opt)}
                  className={`rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors ${
                    slippage === opt ? "bg-jade/20 text-jade-bright" : "bg-surface text-sage hover:text-ivory"
                  }`}
                >
                  {opt}%
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-xs text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success banner */}
      {txHash && (
        <a
          href={explorerTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2.5 rounded-xl border border-jade/40 bg-jade/10 px-4 py-3 text-xs text-jade-bright"
        >
          <Droplets className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1">Likuiditas berhasil ditambahkan. Lihat transaksi.</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        </a>
      )}

      <button
        onClick={handleCta}
        disabled={connecting || processing || ctaDisabled}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-jade to-jade-bright text-sm font-semibold text-obsidian shadow-jade-glow transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {!address ? (
          <WalletIcon className="h-4 w-4" strokeWidth={2} />
        ) : processing ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Droplets className="h-4 w-4" strokeWidth={2} />
        )}
        {connecting ? "Menghubungkan…" : stageLabel()}
      </button>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-sage">
        Tersambung langsung ke ThorDexRouter di {KRYVORA_NETWORK.chainName}. Kalau pool belum ada,
        pool baru otomatis dibuat dan rasio ditentukan dari jumlah yang kamu masukkan.
      </p>
    </>
  );

  return (
    <>
      {variant === "inline" ? (
        <div className="rounded-2xl border border-gold/20 bg-surface px-4 pb-5 pt-4">
          <h3 className="font-display text-lg text-ivory">Tambah Likuiditas</h3>
          {formContent}
        </div>
      ) : (
        <div className="fixed inset-0 z-[95] flex items-end justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-t-3xl border-t border-gold/25 bg-surface px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-ivory">Tambah Likuiditas</h3>
              <button onClick={handleClose} aria-label="Tutup" className="text-sage hover:text-ivory">
                <X className="h-5 w-5" />
              </button>
            </div>
            {formContent}
          </div>
        </div>
      )}

      <LiquidityTokenPicker
        open={selecting !== null}
        excludeAddress={selecting === "a" ? tokenB?.address : tokenA.address}
        onSelect={handleSelect}
        onClose={() => setSelecting(null)}
      />
    </>
  );
}
