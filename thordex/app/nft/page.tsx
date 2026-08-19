import type { Metadata } from "next";
import { CreateNftBanner } from "@/components/CreateNftBanner";
import { NftCollectionRow } from "@/components/NftCollectionRow";
import { NftExplore } from "@/components/NftExplore";

export const metadata: Metadata = {
  title: "NFT Marketplace — Thordex",
  description: "Discover, collect, and create NFTs on Kryvora Network.",
};

export default function NftPage() {
  return (
    <>
      <CreateNftBanner />
      <NftCollectionRow />
      <NftExplore />
    </>
  );
}
