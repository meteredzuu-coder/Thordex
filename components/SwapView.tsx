"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ChevronDown,
  ExternalLink,
  Loader2,
  Repeat,
  Settings2,
  Wallet as WalletIcon,
} from "lucide-react";
import { useWallet } from "@/app/providers";
import {
  AMM_FACTORY_ADDRESS,
  AMM_FACTORY_ABI,
  ERC20_MIN_ABI,
  ROUTER_ADDRESS,
  ROUTER_ABI,
  WKRY_ADDRESS,
  KRYVORA_NETWORK,
  ZERO_ADDRESS,
  explorerTxUrl,
} from "@/lib/contracts";
import { formatToken } from "@/lib/format";
import { TokenAvatar } from "./TokenAvatar";
import { NATIVE_TOKEN, type OnChainToken } from "./LiquidityTokenPicker";
import { SwapTokenPicker } from "./SwapTokenPicker";

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0];
const DEADLINE_MINUTES = 20;
const QUOTE_DEBOUNCE_MS = 400;
const NATIVE_MAX_GAS_BUFFER = 0.0005; // disisakan dari saldo native saat pakai "Maks", biar tetap ada gas

function addressOf(token: OnChainToken): string {
  return token.address === "native" ? WKRY_ADDRESS : token.address;
}

function humanizeError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("user rejected") || msg.includes("user denied") || msg.includes("action_rejected")) {
    return "Transaksi dibatalkan di wallet.";
  }
  if (msg.includes("insufficient funds")) return "Saldo tidak cukup untuk transaksi + gas.";
  if (msg.includes("insufficient output amount")) {
    return "Rate berubah saat transaksi diproses — coba lagi atau naikkan slippage.";
  }
  if (msg.includes("insufficient liquidity")) return "Likuiditas pool tidak cukup untuk jumlah ini.";
  if (msg.includes("pair not found") || msg.includes("invalid path")) {
    return "Belum ada pool untuk pasangan token ini.";
  }
  if (msg.includes("expired")) return "Transaksi kedaluwarsa, coba lagi.";
  if (msg.includes("wallet tidak terdeteksi")) return raw;
  return raw.length > 140 ? "Terjadi kesalahan saat swap. Coba lagi." : raw;
}

export function SwapView() {
  const { address, balance: nativeBalance, connect, connecting } = useWallet();

  const [fromToken, setFromToken] = useState<OnChainToken>(NATIVE_TOKEN);
  const [toToken, setToToken] = useState<OnChainToken | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [selecting, setSelecting] = useState<"from" | "to" | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [balanceFrom, setBalanceFrom] = useState<number | null>(null);
  const [balanceTo, setBalanceTo] = useState<number | null>(null);

  const [pathAddresses, setPathAddresses] = useState<string[] | null>(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [noPool, setNoPool] = useState(false);

  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [toAmountRaw, setToAmountRaw] = useState<bigint | null>(null);
  const [toAmountNum, setToAmountNum] = useState(0);

  const [stage, setStage] = useState<"idle" | "approving" | "confirming" | "mining">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const sameToken = Boolean(toToken) && addressOf(fromToken).toLowerCase() === addressOf(toToken!).toLowerCase();

  // Saldo Bayar & Terima — dibaca langsung dari chain (native lewat useWallet, ERC20 lewat balanceOf).
  useEffect(() => {
    let cancelled = false;
    async function loadBalances() {
      if (!address) {
        setBalanceFrom(null);
        setBalanceTo(null);
        return;
      }
      const { JsonRpcProvider, Contract, formatUnits } = await import("ethers");
      const provider = new JsonRpcProvider(KRYVORA_NETWORK.rpcUrls[0]);

      if (fromToken.address === "native") {
        setBalanceFrom(parseFloat(nativeBalance ?? "0"));
      } else {
        try {
          const token = new Contract(fromToken.address, ERC20_MIN_ABI, provider);
          const raw: bigint = await token.balanceOf(address);
          if (!cancelled) setBalanceFrom(Number(formatUnits(raw, fromToken.decimals)));
        } catch {
          if (!cancelled) setBalanceFrom(0);
        }
      }

      if (!toToken) {
        setBalanceTo(null);
      } else if (toToken.address === "native") {
        setBalanceTo(parseFloat(nativeBalance ?? "0"));
      } else {
        try {
          const token = new Contract(toToken.address, ERC20_MIN_ABI, provider);
          const raw: bigint = await token.balanceOf(address);
          if (!cancelled) setBalanceTo(Number(formatUnits(raw, toToken.decimals)));
        } catch {
          if (!cancelled) setBalanceTo(0);
        }
      }
    }
    loadBalances();
    return () => {
      cancelled = true;
    };
  }, [address, fromToken, toToken, nativeBalance, refreshKey]);

  // Cari jalur swap: pair langsung dulu, kalau tidak ada coba 2-hop lewat WKRY.
  useEffect(() => {
    let cancelled = false;
    async function resolvePath() {
      if (!toToken || sameToken) {
        setPathAddresses(null);
        setNoPool(false);
        return;
      }
      setPathLoading(true);
      try {
        const { JsonRpcProvider, Contract } = await import("ethers");
        const provider = new JsonRpcProvider(KRYVORA_NETWORK.rpcUrls[0]);
        const factory = new Contract(AMM_FACTORY_ADDRESS, AMM_FACTORY_ABI, provider);
        const addrFrom = addressOf(fromToken);
        const addrTo = addressOf(toToken);

        const direct: string = await factory.getPair(addrFrom, addrTo);
        if (direct && direct.toLowerCase() !== ZERO_ADDRESS) {
          if (!cancelled) {
            setPathAddresses([addrFrom, addrTo]);
            setNoPool(false);
          }
          return;
        }

        const isFromWkry = addrFrom.toLowerCase() === WKRY_ADDRESS.toLowerCase();
        const isToWkry = addrTo.toLowerCase() === WKRY_ADDRESS.toLowerCase();
        if (!isFromWkry && !isToWkry) {
          const [pairA, pairB] = await Promise.all([
            factory.getPair(addrFrom, WKRY_ADDRESS),
            factory.getPair(WKRY_ADDRESS, addrTo),
          ]);
          const hasA = pairA && pairA.toLowerCase() !== ZERO_ADDRESS;
          const hasB = pairB && pairB.toLowerCase() !== ZERO_ADDRESS;
          if (hasA && hasB) {
            if (!cancelled) {
              setPathAddresses([addrFrom, WKRY_ADDRESS, addrTo]);
              setNoPool(false);
            }
            return;
          }
        }

        if (!cancelled) {
          setPathAddresses(null);
          setNoPool(true);
        }
      } catch {
        if (!cancelled) {
          setPathAddresses(null);
          setNoPool(true);
        }
      } finally {
        if (!cancelled) setPathLoading(false);
      }
    }
    resolvePath();
    return () => {
      cancelled = true;
    };
  }, [fromToken, toToken, sameToken]);

  // Kuota harga: panggil router.getAmountsOut on-chain (debounced) tiap jumlah/jalur berubah.
  useEffect(() => {
    const amountNum = parseFloat(fromAmount) || 0;
    if (!toToken || !pathAddresses || amountNum <= 0) {
      setToAmountRaw(null);
      setToAmountNum(0);
      setQuoteError(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    setQuoteError(null);
    const timer = setTimeout(async () => {
      try {
        const { JsonRpcProvider, Contract, parseUnits, formatUnits } = await import("ethers");
        const provider = new JsonRpcProvider(KRYVORA_NETWORK.rpcUrls[0]);
        const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);
        const rawIn = parseUnits(fromAmount, fromToken.decimals);
        const amounts: bigint[] = await router.getAmountsOut(rawIn, pathAddresses);
        const rawOut = amounts[amounts.length - 1];
        if (!cancelled) {
          setToAmountRaw(rawOut);
          setToAmountNum(Number(formatUnits(rawOut, toToken.decimals)));
        }
      } catch (err: any) {
        if (!cancelled) {
          setToAmountRaw(null);
          setToAmountNum(0);
          const raw = (err?.reason || err?.shortMessage || err?.message || "").toLowerCase();
          setQuoteError(
            raw.includes("liquidity") ? "Likuiditas pool tidak cukup untuk jumlah ini." : "Gagal mengambil kuota harga."
          );
        }
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }, QUOTE_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fromAmount, pathAddresses, fromToken, toToken]);

  const fromAmountNum = parseFloat(fromAmount) || 0;
  const rate = fromAmountNum > 0 && toAmountNum > 0 ? toAmountNum / fromAmountNum : null;
  const minReceived = toAmountNum > 0 ? toAmountNum * (1 - slippage / 100) : 0;

  const fromBalance = balanceFrom ?? 0;
  const insufficientBalance = address ? fromAmountNum > fromBalance : false;

  function handleFlip() {
    if (!toToken) return;
    const prevFrom = fromToken;
    setFromToken(toToken);
    setToToken(prevFrom);
    setFromAmount(toAmountNum > 0 ? String(toAmountNum) : "");
    setErrorMsg(null);
    setTxHash(null);
  }

  function handleSelect(token: OnChainToken) {
    if (selecting === "from") {
      if (toToken && token.address === toToken.address) setToToken(fromToken);
      setFromToken(token);
    } else if (selecting === "to") {
      if (token.address === fromToken.address) setFromToken(toToken ?? NATIVE_TOKEN);
      setToToken(token);
    }
    setFromAmount("");
    setErrorMsg(null);
    setTxHash(null);
  }

  function handleMax() {
    if (fromBalance <= 0) return;
    if (fromToken.address === "native") {
      const usable = Math.max(fromBalance - NATIVE_MAX_GAS_BUFFER, 0);
      setFromAmount(usable > 0 ? String(usable) : "");
    } else {
      setFromAmount(String(fromBalance));
    }
  }

  const processing = stage !== "idle";

  const ctaLabel = useMemo(() => {
    if (!address) return "Connect Wallet";
    if (!toToken) return "Pilih Token";
    if (sameToken) return "Token Tidak Boleh Sama";
    if (fromAmountNum <= 0) return "Masukkan Jumlah";
    if (insufficientBalance) return `Saldo ${fromToken.symbol} Tidak Cukup`;
    if (pathLoading) return "Memeriksa Pool…";
    if (noPool) return "Belum Ada Pool";
    if (quoting) return "Menghitung…";
    if (quoteError) return "Swap Tidak Tersedia";
    return "Swap";
  }, [address, toToken, sameToken, fromAmountNum, insufficientBalance, fromToken.symbol, pathLoading, noPool, quoting, quoteError]);

  const ctaDisabled =
    Boolean(address) &&
    (!toToken ||
      sameToken ||
      fromAmountNum <= 0 ||
      insufficientBalance ||
      pathLoading ||
      noPool ||
      quoting ||
      Boolean(quoteError) ||
      !toAmountRaw);

  function stageLabel(): string {
    if (stage === "approving") return `Approve ${fromToken.symbol}…`;
    if (stage === "confirming") return "Konfirmasi di wallet…";
    if (stage === "mining") return "Memproses transaksi…";
    return ctaLabel;
  }

  async function handleCta() {
    if (!address) {
      connect();
      return;
    }
    if (ctaDisabled || processing || !toToken || !pathAddresses || !toAmountRaw) return;

    setErrorMsg(null);
    setTxHash(null);

    try {
      const { BrowserProvider, Contract, parseUnits } = await import("ethers");
      const browserProvider = new BrowserProvider((window as any).ethereum);
      const signer = await browserProvider.getSigner();
      const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

      const deadline = Math.floor(Date.now() / 1000) + DEADLINE_MINUTES * 60;
      const rawIn = parseUnits(fromAmount, fromToken.decimals);
      const slippageBps = BigInt(Math.round((1 - slippage / 100) * 10000));
      const rawOutMin = (toAmountRaw * slippageBps) / BigInt(10000);

      const fromIsNative = fromToken.address === "native";
      const toIsNative = toToken.address === "native";

      let receiptHash: string;

      if (fromIsNative) {
        setStage("confirming");
        const tx = await router.swapExactETHForTokens(rawOutMin, pathAddresses, address, deadline, { value: rawIn });
        setStage("mining");
        const receipt = await tx.wait();
        receiptHash = receipt.hash;
      } else {
        setStage("approving");
        const erc20 = new Contract(fromToken.address, ERC20_MIN_ABI, signer);
        const allowance: bigint = await erc20.allowance(address, ROUTER_ADDRESS);
        if (allowance < rawIn) {
          const approveTx = await erc20.approve(ROUTER_ADDRESS, rawIn);
          await approveTx.wait();
        }

        setStage("confirming");
        const tx = toIsNative
          ? await router.swapExactTokensForETH(rawIn, rawOutMin, pathAddresses, address, deadline)
          : await router.swapExactTokensForTokens(rawIn, rawOutMin, pathAddresses, address, deadline);
        setStage("mining");
        const receipt = await tx.wait();
        receiptHash = receipt.hash;
      }

      setTxHash(receiptHash);
      setFromAmount("");
      setToAmountRaw(null);
      setToAmountNum(0);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      const raw = err?.reason || err?.shortMessage || err?.info?.error?.message || err?.message || String(err);
      setErrorMsg(humanizeError(raw));
    } finally {
      setStage("idle");
    }
  }

  return (
    <div className="px-6 pb-4">
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ivory">Swap</h1>
          <p className="mt-1 text-sm text-sage">Tukar token secara instan di {KRYVORA_NETWORK.chainName}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/25 text-sage">
          <Settings2 className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>

      {/* Kartu tukar */}
      <div className="relative mt-6">
        {/* Anda Bayar */}
        <div className="rounded-2xl border border-gold/20 bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-sage">Anda Bayar</span>
            {address && balanceFrom !== null && (
              <button onClick={handleMax} className="text-[11px] font-medium text-jade-bright hover:underline">
                Saldo: {formatToken(fromBalance)} · Maks
              </button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input
              value={fromAmount}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*\.?\d*$/.test(v)) setFromAmount(v);
              }}
              inputMode="decimal"
              placeholder="0.0"
              className="w-full min-w-0 bg-transparent font-display text-2xl text-ivory placeholder:text-sage/40 outline-none"
            />
            <button
              onClick={() => setSelecting("from")}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-obsidian py-1.5 pl-1.5 pr-3 transition-colors hover:border-jade/40"
            >
              <TokenAvatar symbol={fromToken.symbol} address={fromToken.address} size={26} />
              <span className="text-sm font-semibold text-ivory">{fromToken.symbol}</span>
              <ChevronDown className="h-3.5 w-3.5 text-sage" />
            </button>
          </div>
        </div>

        {/* Tombol balik arah */}
        <div className="relative z-10 -my-3 flex justify-center">
          <button
            onClick={handleFlip}
            disabled={!toToken}
            aria-label="Balik arah swap"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-emerald-deep text-jade-bright shadow-jade-glow transition-transform hover:rotate-180 disabled:opacity-50 disabled:hover:rotate-0"
          >
            <ArrowDown className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Anda Terima */}
        <div className="rounded-2xl border border-gold/20 bg-surface p-4 pt-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-sage">Anda Terima</span>
            {address && toToken && balanceTo !== null && (
              <span className="text-[11px] text-sage">Saldo: {formatToken(balanceTo)}</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <p className="flex w-full min-w-0 items-center gap-2 truncate font-display text-2xl text-ivory">
              {quoting ? (
                <Loader2 className="h-5 w-5 animate-spin text-sage" strokeWidth={2} />
              ) : toAmountNum > 0 ? (
                formatToken(toAmountNum)
              ) : (
                <span className="text-sage/40">0.0</span>
              )}
            </p>
            <button
              onClick={() => setSelecting("to")}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-obsidian py-1.5 pl-1.5 pr-3 transition-colors hover:border-jade/40"
            >
              {toToken ? (
                <>
                  <TokenAvatar symbol={toToken.symbol} address={toToken.address} size={26} />
                  <span className="text-sm font-semibold text-ivory">{toToken.symbol}</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-ivory">Pilih Token</span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-sage" />
            </button>
          </div>
        </div>
      </div>

      {/* Peringatan tidak ada pool / gagal kuota */}
      {toToken && !sameToken && !pathLoading && (noPool || quoteError) && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-gold/25 bg-obsidian px-4 py-3 text-xs text-sage">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} />
          <span>
            {noPool
              ? `Belum ada pool likuiditas untuk pasangan ${fromToken.symbol}/${toToken.symbol}.`
              : quoteError}
          </span>
        </div>
      )}

      {/* Info rate & slippage */}
      <div className="mt-4 space-y-2.5 rounded-xl border border-gold/15 bg-surface px-4 py-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-sage">Rate</span>
          <span className="font-mono text-ivory">
            {rate ? `1 ${fromToken.symbol} ≈ ${formatToken(rate)} ${toToken?.symbol}` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-sage">Biaya Swap</span>
          <span className="font-mono text-ivory">0.3%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-sage">Slippage Tolerance</span>
          <div className="flex gap-1.5">
            {SLIPPAGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setSlippage(opt)}
                className={`rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  slippage === opt
                    ? "bg-jade/20 text-jade-bright"
                    : "bg-obsidian text-sage hover:text-ivory"
                }`}
              >
                {opt}%
              </button>
            ))}
          </div>
        </div>
        {toAmountNum > 0 && toToken && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-sage">Minimum Diterima</span>
            <span className="font-mono text-ivory">
              {formatToken(minReceived)} {toToken.symbol}
            </span>
          </div>
        )}
      </div>

      {/* Error banner (tx) */}
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
          <Repeat className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1">Swap berhasil. Lihat transaksi.</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        </a>
      )}

      {/* CTA */}
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
          <Repeat className="h-4 w-4" strokeWidth={2} />
        )}
        {connecting ? "Menghubungkan…" : stageLabel()}
      </button>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-sage">
        Tersambung langsung ke ThorDexRouter di {KRYVORA_NETWORK.chainName}. Rate dihitung dari reserve pool
        on-chain asli, sudah termasuk biaya swap 0.3%.
      </p>

      <SwapTokenPicker
        open={selecting !== null}
        excludeAddress={selecting === "from" ? toToken?.address : fromToken.address}
        onSelect={handleSelect}
        onClose={() => setSelecting(null)}
      />
    </div>
  );
}
