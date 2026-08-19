"use client";

import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { Drawer } from "./Drawer";
import { SearchOverlay } from "./SearchOverlay";

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/20 bg-obsidian/90 backdrop-blur">
        <div className="mx-auto flex max-w-[560px] items-center justify-between px-4 py-3.5">
          <button
            aria-label="Buka menu"
            onClick={() => setDrawerOpen(true)}
            className="text-ivory/90 transition-colors hover:text-gold"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <span className="font-display text-[15px] tracking-[0.32em] text-ivory">
            THOR<span className="text-jade">DEX</span>
          </span>

          <button
            aria-label="Cari koin"
            onClick={() => setSearchOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-emerald-deep"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
