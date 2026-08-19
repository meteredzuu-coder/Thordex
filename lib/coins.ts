export type Coin = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number; // dalam persen
  initials: string;
  accent: string; // hex, dipakai untuk gradasi avatar
};

// Data contoh (mock) — ganti dengan data on-chain/API asli saat backend sudah siap.
export const coins: Coin[] = [
  { id: "thor", name: "Thordex", symbol: "THOR", price: 4.128, change24h: 6.42, initials: "TH", accent: "#1FAE72" },
  { id: "nova", name: "Novacoin", symbol: "NOVA", price: 0.842, change24h: -2.13, initials: "NV", accent: "#C6A15B" },
  { id: "aeris", name: "Aeris", symbol: "AER", price: 12.55, change24h: 3.08, initials: "AE", accent: "#3FE39A" },
  { id: "lumen", name: "Lumen", symbol: "LUM", price: 0.093, change24h: 1.27, initials: "LU", accent: "#E4CE9B" },
  { id: "vaultx", name: "VaultX", symbol: "VLTX", price: 88.2, change24h: -0.64, initials: "VX", accent: "#1FAE72" },
  { id: "ember", name: "Ember", symbol: "EMB", price: 2.774, change24h: 4.91, initials: "EM", accent: "#C6A15B" },
];

export const topCoin = coins[0];
