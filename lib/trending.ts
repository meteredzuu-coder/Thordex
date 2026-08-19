export type TrendingToken = {
  id: string;
  symbol: string;
  name: string;
  initials: string;
  accent: string; // hex, dipakai untuk gradasi avatar
  age?: string; // umur token, mis. "19h"
  boost?: number; // jumlah boost, mis. 500
  highlight?: boolean; // simbol berwarna gold, mis. token yang sedang panas
  priceZeros?: number; // jumlah nol yang ditulis subscript setelah "0.0"
  priceDigits: string; // digit yang tampil setelah "0.0" (atau setelah subscript)
  change1h: number; // dalam persen
  change24h: number; // dalam persen
  liq: string; // sudah diformat, mis. "$33K"
  vol: string;
  mcap: string;
};

// Data contoh (mock) — ganti dengan data on-chain/API asli saat backend sudah siap.
export const trendingTokens: TrendingToken[] = [
  {
    id: "pharo",
    symbol: "PHARO",
    name: "Pharaoh Rising",
    initials: "PH",
    accent: "#C6A15B",
    age: "19h",
    boost: 500,
    highlight: true,
    priceZeros: 3,
    priceDigits: "1516",
    change1h: -11,
    change24h: 123,
    liq: "$33K",
    vol: "$3.7M",
    mcap: "$150K",
  },
  {
    id: "gildor",
    symbol: "GILDOR",
    name: "Gilded Oracle",
    initials: "GO",
    accent: "#1FAE72",
    age: "6h",
    priceZeros: 3,
    priceDigits: "2093",
    change1h: 18,
    change24h: 557,
    liq: "$43K",
    vol: "$10.5M",
    mcap: "$207K",
  },
  {
    id: "jadefox",
    symbol: "JADEFOX",
    name: "Jade Fox",
    initials: "JF",
    accent: "#3FE39A",
    age: "4h",
    boost: 100,
    priceZeros: 3,
    priceDigits: "5113",
    change1h: -31,
    change24h: 849,
    liq: "$55K",
    vol: "$1.7M",
    mcap: "$504K",
  },
  {
    id: "obsy",
    symbol: "OBSY",
    name: "Obsidian Ninety-Nine",
    initials: "OB",
    accent: "#7C9186",
    priceDigits: "02185",
    change1h: 25,
    change24h: 39,
    liq: "$148K",
    vol: "$5.1M",
    mcap: "$2.1M",
  },
  {
    id: "redfang",
    symbol: "REDFANG",
    name: "Red Fang's Eye",
    initials: "RF",
    accent: "#E4CE9B",
    age: "18h",
    priceZeros: 3,
    priceDigits: "1234",
    change1h: 0,
    change24h: 250,
    liq: "$25K",
    vol: "$530K",
    mcap: "$120K",
  },
  {
    id: "viperx",
    symbol: "VIPERX",
    name: "Viper X",
    initials: "VX",
    accent: "#C6A15B",
    age: "2h",
    boost: 50,
    priceZeros: 3,
    priceDigits: "1354",
    change1h: -10,
    change24h: 380,
    liq: "$28K",
    vol: "$1M",
    mcap: "$133K",
  },
  {
    id: "goldcat",
    symbol: "GOLDCAT",
    name: "Gold Cat",
    initials: "GC",
    accent: "#1FAE72",
    boost: 100,
    priceZeros: 3,
    priceDigits: "2587",
    change1h: 2,
    change24h: -45,
    liq: "$41K",
    vol: "$682K",
    mcap: "$256K",
  },
  {
    id: "shadeking",
    symbol: "SHADEKING",
    name: "Shade King",
    initials: "SK",
    accent: "#3FE39A",
    priceDigits: "01702",
    change1h: -6,
    change24h: 3021,
    liq: "$386K",
    vol: "$13.7M",
    mcap: "$1.7M",
  },
  {
    id: "moondrake",
    symbol: "MOONDRAKE",
    name: "Moon Drake",
    initials: "MD",
    accent: "#E4CE9B",
    age: "17h",
    boost: 100,
    priceZeros: 3,
    priceDigits: "6473",
    change1h: -53,
    change24h: 12345,
    liq: "$108K",
    vol: "$1M",
    mcap: "$647K",
  },
  {
    id: "babythor",
    symbol: "BABYTHOR",
    name: "Baby Thor",
    initials: "BT",
    accent: "#C6A15B",
    age: "12h",
    boost: 100,
    priceZeros: 3,
    priceDigits: "2094",
    change1h: -10,
    change24h: 560,
    liq: "$62K",
    vol: "$2.4M",
    mcap: "$198K",
  },
];

export type MetaFilter = {
  id: string;
  emoji: string;
  label: string;
  value: string;
  trend: "up" | "down";
};

// Data contoh (mock) — kategori meta yang sedang ramai diperdagangkan.
export const metaFilters: MetaFilter[] = [
  { id: "royalty", emoji: "\u{1F451}", label: "Royalty", value: "$10.29B", trend: "up" },
  { id: "legends", emoji: "\u{2694}\u{FE0F}", label: "Legends", value: "$578.5M", trend: "down" },
  { id: "ai", emoji: "\u{1F916}", label: "AI", value: "$312.8M", trend: "up" },
  { id: "relics", emoji: "\u{1FFA}", label: "Relics", value: "$94.6M", trend: "up" },
];

// Data contoh (mock) — ringkasan pasar 24 jam.
export const screenerStats = {
  volume24h: "$42.34B",
  txns24h: "40,285,507",
};

export function formatScreenerPercent1h(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 10) return `${sign}${Math.round(abs)}%`;
  return `${sign}${abs.toFixed(1)}%`;
}

export function formatScreenerPercent24h(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1000) return `${sign}${Math.round(abs / 1000)}K%`;
  return `${sign}${Math.round(abs)}%`;
}

export function parseAgeHours(age?: string): number {
  if (!age) return Number.POSITIVE_INFINITY;
  const match = age.match(/(\d+)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}
