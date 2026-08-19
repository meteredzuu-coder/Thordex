"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Image as ImageIcon, ChevronDown, Globe, Rocket } from "lucide-react";
import { useComingSoon } from "@/app/providers";

const MAX_NAME = 32;
const MAX_SYMBOL = 10;
const MAX_DESCRIPTION = 300;

function RequiredBadge() {
  return (
    <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gold">
      Required
    </span>
  );
}

export function CreateCoinForm() {
  const { openComingSoon } = useComingSoon();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");

  const [tokenImage, setTokenImage] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const [bannerOpen, setBannerOpen] = useState(true);
  const [socialOpen, setSocialOpen] = useState(true);

  const [telegram, setTelegram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [discord, setDiscord] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  function handleTokenImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setTokenImage(URL.createObjectURL(file));
  }

  function handleBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBanner(URL.createObjectURL(file));
  }

  function handleSubmit() {
    openComingSoon("Create Token");
  }

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
          {tokenImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tokenImage} alt="Token" className="h-full w-full object-cover" />
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
              {banner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={banner} alt="Banner" className="h-full w-full object-cover" />
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
          <RequiredBadge />
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

      {/* Buy tokens at launch */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-gold/20 bg-surface px-4 py-3.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-emerald-deep text-gold">
          <Rocket className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-ivory">Buy tokens at launch</span>
            <RequiredBadge />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-sage">
            Every launch requires the creator to buy in first — you&apos;ll set the amount in the next step.
          </p>
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-jade to-jade-bright text-sm font-semibold text-obsidian shadow-jade-glow transition-opacity hover:opacity-90"
      >
        <Rocket className="h-4 w-4" strokeWidth={2} />
        Create Token
      </button>
      <p className="mt-3 text-center text-[11px] text-sage">Deploys on Kryvora Network • Takes a few seconds</p>
    </div>
  );
}
