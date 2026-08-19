import { collections } from "@/lib/nfts";
import { SectionHeading } from "./SectionHeading";
import { NftCollectionCard } from "./NftCollectionCard";

export function NftCollectionRow() {
  return (
    <section className="mb-9">
      <SectionHeading>Trending Collections</SectionHeading>
      <div className="flex gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collections.map((collection) => (
          <NftCollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
}
