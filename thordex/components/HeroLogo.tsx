export function HeroLogo() {
  return (
    <section className="flex flex-col items-center px-6 pb-8 pt-10 text-center">
      <div className="medallion flex h-28 w-28 items-center justify-center rounded-full shadow-gold-glow">
        <span className="font-display text-4xl italic text-ivory">T</span>
      </div>
      <h1 className="mt-5 font-display text-2xl tracking-[0.08em] text-ivory">
        THOR<span className="text-jade">DEX</span>
      </h1>
      <p className="mt-2 max-w-[280px] text-sm text-sage">
        Bursa, launchpad, dan dompet multi-chain dalam satu pengalaman premium.
      </p>
    </section>
  );
}
