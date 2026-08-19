export function HeroLogo() {
  return (
    <section className="relative flex flex-col items-center px-6 pb-8 pt-10 text-center">
      <span className="absolute left-4 top-1 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-jade/40 bg-jade/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-jade-bright">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade-bright" />
        Live on Kryvora Network
      </span>

      <div className="medallion flex h-28 w-28 items-center justify-center overflow-hidden rounded-full shadow-gold-glow">
        <img
          src="https://magenta-advisory-cardinal-566.mypinata.cloud/ipfs/bafybeidjzga3axioyma6xecfz2qu6mrsmn4gkqhtvej7kl4hbvwz3tppii"
          alt="Thordex"
          className="h-full w-full object-cover"
        />
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
