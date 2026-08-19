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

export type Pool = {
  id: string;
  tokenAId: string;
  tokenBId: string;
  tvl: number; // total value locked, dalam USD (mock)
  apr: number; // dalam persen (mock)
  myLiquidityUsd?: number; // posisi milik user, jika ada (mock)
};

// Data contoh (mock) — ganti dengan data pool on-chain asli saat backend sudah siap.
export const pools: Pool[] = [
  { id: "thor-native", tokenAId: "thor", tokenBId: "native", tvl: 482300, apr: 34.2, myLiquidityUsd: 1240.5 },
  { id: "nova-native", tokenAId: "nova", tokenBId: "native", tvl: 214800, apr: 21.6 },
  { id: "aeris-thor", tokenAId: "aeris", tokenBId: "thor", tvl: 96450, apr: 45.8 },
  { id: "lumen-native", tokenAId: "lumen", tokenBId: "native", tvl: 58900, apr: 18.3 },
  { id: "vaultx-native", tokenAId: "vaultx", tokenBId: "native", tvl: 331700, apr: 12.4, myLiquidityUsd: 640 },
  { id: "ember-thor", tokenAId: "ember", tokenBId: "thor", tvl: 74200, apr: 27.9 },
];

export function poolTvlTotal(): number {
  return pools.reduce((sum, p) => sum + p.tvl, 0);
}

export function myLiquidityTotal(): number {
  return pools.reduce((sum, p) => sum + (p.myLiquidityUsd ?? 0), 0);
}
