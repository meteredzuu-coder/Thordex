import { coins, type Coin } from "./coins";
import { KRYVORA_NETWORK } from "./network";

// Token native jaringan (ETH di Kryvora Network) — direpresentasikan sebagai "Coin"
// semu agar bisa dipakai bergantian dengan token lain di form Swap & Liquidity.
export const nativeToken: Coin = {
  id: "native",
  name: KRYVORA_NETWORK.nativeCurrency.name,
  symbol: KRYVORA_NETWORK.nativeCurrency.symbol,
  price: 3120.45, // harga contoh (mock) dalam USD
  change24h: 1.85,
  initials: "ETH",
  accent: "#8FA6C9",
};

// Daftar lengkap token yang bisa dipilih di Swap & Liquidity.
export const swapTokens: Coin[] = [nativeToken, ...coins];

export function findToken(id: string): Coin {
  return swapTokens.find((t) => t.id === id) ?? swapTokens[0];
}

// Catatan: daftar pool likuiditas (dulu data contoh/mock di sini) sekarang diambil langsung
// dari ThorDexAMMFactory on-chain — lihat lib/onchainPools.ts, dipakai oleh LiquidityView.
