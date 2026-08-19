"use client";

import { Sparkles, X } from "lucide-react";

export function ComingSoonModal({
  label,
  onClose,
}: {
  label: string | null;
  onClose: () => void;
}) {
  if (!label) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-gold/40 bg-surface p-7 text-center shadow-jade-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 text-sage hover:text-ivory"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 bg-emerald-deep">
          <Sparkles className="h-5 w-5 text-gold" />
        </div>

        <p className="font-display text-xs uppercase tracking-[0.25em] text-gold">Segera Hadir</p>
        <h3 className="mt-2 font-display text-xl text-ivory">{label}</h3>
        <p className="mt-2 text-sm text-sage">Fitur ini sedang kami siapkan. Nantikan kabarnya.</p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full border border-jade/40 bg-jade/10 py-2.5 text-sm font-semibold text-jade transition-colors hover:bg-jade/20"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
