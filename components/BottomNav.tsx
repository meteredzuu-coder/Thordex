"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Image as ImageIcon, Wallet, Droplets, Repeat, CandlestickChart } from "lucide-react";
import { useComingSoon } from "@/app/providers";

const items = [
  { key: "home", label: "Home", href: "/", icon: Home },
  { key: "create-coin", label: "Create", icon: PlusCircle },
  { key: "nft", label: "NFT", icon: ImageIcon },
  { key: "wallet", label: "Wallet", icon: Wallet },
  { key: "liquidity", label: "Liquidity", icon: Droplets },
  { key: "swap", label: "Swap", icon: Repeat },
  { key: "dexscreener", label: "Dexscreener", icon: CandlestickChart },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { openComingSoon } = useComingSoon();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-obsidian/95 backdrop-blur">
      <div className="mx-auto flex max-w-[560px] items-stretch justify-between px-2">
        {items.map(({ key, label, href, icon: Icon }) => {
          const active = Boolean(href) && href === pathname;

          if (href) {
            return (
              <Link
                key={key}
                href={href}
                className="flex flex-1 flex-col items-center gap-1 py-3 text-[11px]"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                    active ? "border-gold/60 bg-emerald-deep text-jade-bright" : "border-transparent text-sage"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className={active ? "text-ivory" : "text-sage"}>{label}</span>
              </Link>
            );
          }

          return (
            <button
              key={key}
              onClick={() => openComingSoon(label)}
              className="flex flex-1 flex-col items-center gap-1 py-3 text-[11px] text-sage"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
