"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { AlertCircle, Image as ImageIcon, ChevronDown, Globe, Loader2, Rocket } from "lucide-react";
import { useWallet } from "@/app/providers";
import { ensureKryvoraNetwork } from "@/lib/network";
import { TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI, KRYVORA_NETWORK } from "@/lib/contracts";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/lib/ipfs";
import { TokenCreatedModal } from "./TokenCreatedModal";

const MAX_NAME = 32;
const MAX_SYMBOL = 10;
const MAX_DESCRIPTION = 300;

const SUPPLY_PRESETS = [
  { label: "1M", value: "1000000" },
  { label: "10M", value: "10000000" },
  { label: "100M", value: "100000000" },
  { label: "1B", value: "1000000000" },
];

function RequiredBadge() {
  return (
    <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gold">
      Required
    </span>
  );
}

function OptionalBadge() {
  return (
    <span className="shrink-0 rounded-full border border-sage/30 bg-sage/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-sage">
      Optional
    </span>
  );
}

function humanizeError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("user rejected") || msg.includes("user denied") || msg.includes("action_rejected")) {
    return "Transaksi dibatalkan di wallet.";
  }
  if (msg.includes("insufficient funds")) {
    return "Saldo tidak cukup untuk membayar fee + gas.";
  }
  if (msg.includes("fee too low")) {
    return "Fee pembuatan token berubah, coba lagi.";
  }
  if (msg.includes("wallet tidak terdeteksi")) {
    return raw;
  }
  return raw.length > 140 ? "Terjadi kesalahan saat mendeploy token. Coba lagi." : raw;
}

export function CreateCoinForm() {
  const { address, connect } = useWallet();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [totalSupply, setTotalSupply] = useState("");

  const [tokenImageFile, setTokenImageFile] = useState<File | null>(null);
  const [tokenImagePreview, setTokenImagePreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [bannerOpen, setBannerOpen] = useState(true);
  const [socialOpen, setSocialOpen] = useState(true);

  const [telegram, setTelegram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [discord, setDiscord] = useState("");

  const [creationFee, setCreationFee] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "uploading" | "confirming" | "mining">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{ tokenAddress: string; txHash: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Ambil creation fee dari kontrak lewat RPC publik (tidak perlu wallet terhubung dulu).
  useEffect(() => {
    let cancelled = false;
    async function loadFee() {
      try {
        const { JsonRpcProvider, Contract, formatEther } = await import("ethers");
        const readProvider = new JsonRpcProvider(KRYVORA_NETWORK.rpcUrls[0]);
        const factory = new Contract(TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI, readProvider);
        const fee: bigint = await factory.creationFee();
        if (!cancelled) setCreationFee(formatEther(fee));
      } catch {
        if (!cancelled) setCreationFee(null);
      }
    }
    loadFee();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleTokenImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setTokenImageFile(file);
    setTokenImagePreview(URL.createObjectURL(file));
  }

  function handleBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  }

  function handleSupplyChange(v: string) {
    const digitsOnly = v.replace(/[^\d]/g, "");
    setTotalSupply(digitsOnly);
  }

  function validate(): string | null {
    if (!name.trim()) return "Nama token wajib diisi.";
    if (!symbol.trim()) return "Simbol token wajib diisi.";
    if (!tokenImageFile) return "Gambar token wajib diunggah.";
    if (!description.trim()) return "Deskripsi wajib diisi.";
    if (!bannerFile) return "Banner wajib diunggah.";
    if (!totalSupply || BigInt(totalSupply) <= BigInt(0)) return "Jumlah token awal wajib diisi.";
    return null;
  }

  async function ensureConnected(): Promise<string> {
    const ethProvider = (window as any).ethereum;
    if (!ethProvider) {
      throw new Error("Wallet tidak terdeteksi. Install MetaMask atau wallet kompatibel lainnya.");
    }
    if (!address) {
      await connect();
    }
    const accounts: string[] = await ethProvider.request({ method: "eth_accounts" });
    if (!accounts[0]) throw new Error("Wallet belum terhubung.");
    await ensureKryvoraNetwork(ethProvider);
    return accounts[0];
  }

  async function handleSubmit() {
    if (stage !== "idle") return;

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }
    setErrorMsg(null);

    try {
      const account = await ensureConnected();

      setStage("uploading");
      const imageUpload = await uploadFileToIPFS(tokenImageFile!);
      const bannerUpload = await uploadFileToIPFS(bannerFile!);

      const metadata = {
        name: name.trim(),
        symbol: symbol.trim(),
        description: description.trim(),
        image: imageUpload.uri,
        banner: bannerUpload.uri,
        social: {
          telegram: telegram.trim() || undefined,
          twitter: twitter.trim() || undefined,
          website: website.trim() || undefined,
          discord: discord.trim() || undefined,
        },
      };
      const metadataUpload = await uploadJSONToIPFS(metadata);

      setStage("confirming");
      const { BrowserProvider, Contract } = await import("ethers");
      const browserProvider = new BrowserProvider((window as any).ethereum);
      const signer = await browserProvider.getSigner();
      const factory = new Contract(TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI, signer);
      const fee: bigint = await factory.creationFee();
      const supplyBig = BigInt(totalSupply);

      const tx = await factory.createToken(name.trim(), symbol.trim(), supplyBig, metadataUpload.uri, {
        value: fee,
      });

      setStage("mining");
      const receipt = await tx.wait();

      let tokenAddress: string | null = null;
      for (const log of receipt.logs) {
        try {
          const parsed = factory.interface.parseLog(log);
          if (parsed && parsed.name === "TokenCreated") {
            tokenAddress = parsed.args.token as string;
            break;
          }
        } catch {
          // log bukan dari factory, lewati
        }
      }

      // Fallback kalau parsing event gagal: baca daftar token milik creator dari kontrak.
      if (!tokenAddress) {
        try {
          const owned: string[] = await factory.getTokensByCreator(account);
          tokenAddress = owned[owned.length - 1] ?? null;
        } catch {
          // biarkan null, ditangani di bawah
        }
      }

      setResult({ tokenAddress: tokenAddress ?? receipt.contractAddress ?? "", txHash: receipt.hash });
      setShowSuccess(true);
      setStage("idle");
    } catch (err: any) {
      setStage("idle");
      const raw = err?.reason || err?.shortMessage || err?.info?.error?.message || err?.message || String(err);
      setErrorMsg(humanizeError(raw));
    }
  }

  function submitLabel() {
    if (stage === "uploading") return "Mengunggah ke IPFS…";
    if (stage === "confirming") return "Konfirmasi di Wallet…";
    if (stage === "mining") return "Mendeploy Token…";
    if (!address) return "Connect Wallet & Create Token";
    return "Create Token";
  }

  const processing = stage !== "idle";

  return (
    <div className="px-6 pb-10">
      <h1 className="font-display text-2xl text-ivory">Create Your Token</h1>
      <p className="mt-1.5 text-sm text-sage">Create and launch your token in Kryvora Network</p>

      {/* Token Name */}
      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm text-ivory">Token Name</label>
          <span className="font-mono text-[11px] text-sage">
            {name.length}/{MAX_NAME}
          </span>
        </div>
        <input
          value={name}
          maxLength={MAX_NAME}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Thor Kryvora"
          className="w-full rounded-xl border border-gold/20 bg-surface px-4 py-3 text-sm text-ivory placeholder:text-sage/50 outline-none transition-colors focus:border-jade/50"
        />
      </div>

      {/* Token Symbol */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm text-ivory">Token Symbol</label>
          <span className="font-mono text-[11px] text-sage">
            {symbol.length}/{MAX_SYMBOL}
          </span>
        </div>
        <input
          value={symbol}
          maxLength={MAX_SYMBOL}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="e.g. THOR"
          className="w-full rounded-xl border border-gold/20 bg-surface px-4 py-3 text-sm text-ivory placeholder:text-sage/50 outline-none transition-colors focus:border-jade/50"
        />
      </div>

      {/* Initial Token Supply */}
      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <label className="text-sm text-ivory">Initial Token Supply</label>
          <RequiredBadge />
        </div>
        <input
          value={totalSupply ? Number(totalSupply).toLocaleString("en-US") : ""}
          inputMode="numeric"
          onChange={(e) => handleSupplyChange(e.target.value)}
          placeholder="e.g. 1,000,000,000"
          className="w-full rounded-xl border border-gold/20 bg-surface px-4 py-3 text-sm text-ivory placeholder:text-sage/50 outline-none transition-colors focus:border-jade/50"
        />
        <div className="mt-2 flex gap-2">
          {SUPPLY_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setTotalSupply(preset.value)}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                totalSupply === preset.value
                  ? "border-jade/60 bg-jade/15 text-jade-bright"
                  : "border-gold/20 text-sage hover:border-jade/40 hover:text-ivory"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-sage">Semua supply dimint sekali ke wallet kamu saat token dibuat.</p>
      </div>

      {/* Token Image */}
      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <label className="text-sm text-ivory">Token Image</label>
          <RequiredBadge />
          <span className="font-mono text-[11px] text-sage">1:1</span>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png, image/jpeg"
          className="hidden"
          onChange={handleTokenImageChange}
        />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex aspect-square w-32 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-gold/30 bg-surface text-sage transition-colors hover:border-jade/50"
        >
          {tokenImagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tokenImagePreview} alt="Token" className="h-full w-full object-cover" />
          ) : (
            <>
              <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
              <span className="px-2 text-center text-[11px] leading-tight">Upload Image (PNG, JPG)</span>
            </>
          )}
        </button>
      </div>

      {/* Description */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-ivory">Description</label>
            <RequiredBadge />
          </div>
          <span className="font-mono text-[11px] text-sage">
            {description.length}/{MAX_DESCRIPTION}
          </span>
        </div>
        <textarea
          value={description}
          maxLength={MAX_DESCRIPTION}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell the world about your token…"
          rows={4}
          className="w-full resize-none rounded-xl border border-gold/20 bg-surface px-4 py-3 text-sm text-ivory placeholder:text-sage/50 outline-none transition-colors focus:border-jade/50"
        />
      </div>

      {/* Add banner */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gold/20 bg-surface">
        <button
          type="button"
          onClick={() => setBannerOpen((v) => !v)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <ImageIcon className="h-4 w-4 shrink-0 text-sage" strokeWidth={1.75} />
          <span className="flex-1 text-sm text-ivory">Add banner</span>
          <RequiredBadge />
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-sage transition-transform ${bannerOpen ? "rotate-180" : ""}`}
          />
        </button>
        {bannerOpen && (
          <div className="border-t border-gold/10 px-4 pb-4 pt-3">
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={handleBannerChange}
            />
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="flex aspect-[3/1] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-gold/30 text-sage transition-colors hover:border-jade/50"
            >
              {bannerPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bannerPreview} alt="Banner" className="h-full w-full object-cover" />
              ) : (
                <>
                  <ImageIcon className="h-5 w-5" strokeWidth={1.5} />
                  <span className="font-mono text-[11px]">3:1 — PNG, JPG</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Add social links */}
      <div className="mt-4 overflow-hidden rounded-xl border border-gold/20 bg-surface">
        <button
          type="button"
          onClick={() => setSocialOpen((v) => !v)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <Globe className="h-4 w-4 shrink-0 text-sage" strokeWidth={1.75} />
          <span className="flex-1 text-sm text-ivory">Add social links</span>
          <OptionalBadge />
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-sage transition-transform ${socialOpen ? "rotate-180" : ""}`}
          />
        </button>
        {socialOpen && (
          <div className="space-y-3 border-t border-gold/10 px-4 pb-4 pt-3">
            <input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="Telegram (https://t.me/…)"
              className="w-full rounded-lg border border-gold/20 bg-obsidian px-3.5 py-2.5 text-sm text-ivory placeholder:text-sage/50 outline-none transition-colors focus:border-jade/50"
            />
            <input
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="X / Twitter (https://x.com/…)"
              className="w-full rounded-lg border border-gold/20 bg-obsidian px-3.5 py-2.5 text-sm text-ivory placeholder:text-sage/50 outline-none transition-colors focus:border-jade/50"
            />
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Website (https://…)"
              className="w-full rounded-lg border border-gold/20 bg-obsidian px-3.5 py-2.5 text-sm text-ivory placeholder:text-sage/50 outline-none transition-colors focus:border-jade/50"
            />
            <input
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="Discord (https://discord.gg/…)"
              className="w-full rounded-lg border border-gold/20 bg-obsidian px-3.5 py-2.5 text-sm text-ivory placeholder:text-sage/50 outline-none transition-colors focus:border-jade/50"
            />
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

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={processing}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-jade to-jade-bright text-sm font-semibold text-obsidian shadow-jade-glow transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {processing ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Rocket className="h-4 w-4" strokeWidth={2} />}
        {submitLabel()}
      </button>
      <p className="mt-3 text-center text-[11px] text-sage">
        Deploys on Kryvora Network • Takes a few seconds
        {creationFee ? ` • Fee: ${creationFee} ETH` : ""}
      </p>

      <TokenCreatedModal
        open={showSuccess}
        tokenAddress={result?.tokenAddress ?? null}
        txHash={result?.txHash ?? null}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}
