export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3 px-6">
      <span className="whitespace-nowrap font-display text-[11px] uppercase tracking-[0.3em] text-gold">
        {children}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-gold/50 via-gold/15 to-transparent" />
    </div>
  );
}
