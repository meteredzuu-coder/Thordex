import { HeroLogo } from "@/components/HeroLogo";
import { TopCoinInfo } from "@/components/TopCoinInfo";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { CoinList } from "@/components/CoinList";

export default function HomePage() {
  return (
    <>
      <HeroLogo />
      <TopCoinInfo />
      <AnnouncementBanner />
      <CoinList />
    </>
  );
}
