import { coins } from "@/lib/coins";
import { SectionHeading } from "./SectionHeading";
import { CoinRow } from "./CoinRow";

export function CoinList() {
  return (
    <section className="mb-4">
      <SectionHeading>Daftar Koin</SectionHeading>
      <div className="mx-6 overflow-hidden rounded-2xl border border-gold/20">
        {coins.map((coin, i) => (
          <CoinRow key={coin.id} coin={coin} last={i === coins.length - 1} />
        ))}
      </div>
    </section>
  );
}
