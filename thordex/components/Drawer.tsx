"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useComingSoon } from "@/app/providers";

const links = [
  { key: "home", label: "Home", href: "/" },
  { key: "create-coin", label: "Create Coin" },
  { key: "nft", label: "NFT" },
  { key: "wallet", label: "Wallet" },
  { key: "liquidity", label: "Liquidity" },
  { key: "swap", label: "Swap" },
];

export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openComingSoon } = useComingSoon();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] border-r border-gold/25 bg-surface px-6 py-6">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm tracking-[0.28em] text-ivory">MENU</span>
          <button aria-label="Tutup menu" onClick={onClose} className="text-sage hover:text-ivory">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {links.map((link) =>
            link.href ? (
              <Link
                key={link.key}
                href={link.href}
                onClick={onClose}
                className="rounded-lg px-3 py-2.5 font-body text-sm text-ivory hover:bg-emerald-deep"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.key}
                onClick={() => {
                  onClose();
                  openComingSoon(link.label);
                }}
                className="rounded-lg px-3 py-2.5 text-left font-body text-sm text-sage hover:bg-emerald-deep hover:text-ivory"
              >
                {link.label}
              </button>
            )
          )}
        </nav>

        <div className="mt-10 border-t border-gold/15 pt-5">
          <p className="font-display text-[11px] uppercase tracking-[0.25em] text-gold">Thordex</p>
          <p className="mt-1 text-xs text-sage">Bursa &amp; launchpad multi-chain — pratinjau desain.</p>
        </div>
      </div>
    </div>
  );
}
