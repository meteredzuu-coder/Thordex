"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Home, PlusCircle, Image as ImageIcon, Wallet, Droplets, Repeat } from "lucide-react";
import { useComingSoon } from "@/app/providers";
import { ConnectButton } from "./ConnectButton";

const links = [
  { key: "home", label: "Home", href: "/", icon: Home },
  { key: "create-coin", label: "Create Coin", icon: PlusCircle },
  { key: "nft", label: "NFT", icon: ImageIcon },
  { key: "wallet", label: "Wallet", icon: Wallet },
  { key: "liquidity", label: "Liquidity", icon: Droplets },
  { key: "swap", label: "Swap", icon: Repeat },
];

export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openComingSoon } = useComingSoon();
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col border-r border-gold/25 bg-surface px-5 py-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <span className="medallion flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gold/40">
              <img
                src="https://magenta-advisory-cardinal-566.mypinata.cloud/ipfs/bafybeigftehawcozcui6rgynswu4qe22cao6xkaa4uhewsyvgeva5ezlym"
                alt="Thordex"
                className="h-full w-full scale-[1.15] object-cover"
              />
            </span>
            <span className="font-display text-sm tracking-[0.18em] text-ivory">
              THOR<span className="text-jade">DEX</span>
            </span>
          </div>
          <button aria-label="Tutup menu" onClick={onClose} className="text-sage hover:text-ivory">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
          {links.map((link) => {
            const active = Boolean(link.href) && link.href === pathname;
            const Icon = link.icon;

            if (link.href) {
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-colors ${
                    active ? "bg-emerald-deep text-jade-bright" : "text-ivory hover:bg-emerald-deep"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  {link.label}
                </Link>
              );
            }

            return (
              <button
                key={link.key}
                onClick={() => {
                  onClose();
                  openComingSoon(link.label);
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left font-body text-sm text-sage transition-colors hover:bg-emerald-deep hover:text-ivory"
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-gold/15 pt-5">
          <ConnectButton variant="full" />
        </div>
      </div>
    </div>
  );
}
