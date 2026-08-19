export type ArtPattern = "radial" | "diagonal" | "mesh" | "aurora";

export type NftCollection = {
  id: string;
  name: string;
  creator: string;
  floorPrice: number;
  items: number;
  verified: boolean;
  accent: string;
  pattern: ArtPattern;
};

export type NftCategory = "Art" | "Gaming" | "PFP" | "Music" | "Photography";

export type NftItem = {
  id: string;
  name: string;
  collection: string;
  price: number;
  category: NftCategory;
  rarity?: "Rare" | "Epic" | "Legendary";
  accent: string;
  pattern: ArtPattern;
};

// Sample (mock) data — replace with real on-chain/API data once the backend is ready.
export const collections: NftCollection[] = [
  {
    id: "obsidian-wolves",
    name: "Obsidian Wolves",
    creator: "@thorforge",
    floorPrice: 1.85,
    items: 4444,
    verified: true,
    accent: "#1FAE72",
    pattern: "radial",
  },
  {
    id: "golden-serpents",
    name: "Golden Serpents",
    creator: "@lumenlabs",
    floorPrice: 0.92,
    items: 2222,
    verified: true,
    accent: "#C6A15B",
    pattern: "diagonal",
  },
  {
    id: "aurora-dreams",
    name: "Aurora Dreams",
    creator: "@nova.studio",
    floorPrice: 2.4,
    items: 1000,
    verified: false,
    accent: "#7C5CFF",
    pattern: "aurora",
  },
  {
    id: "void-walkers",
    name: "Void Walkers",
    creator: "@vaultx",
    floorPrice: 0.58,
    items: 3333,
    verified: true,
    accent: "#3FE39A",
    pattern: "mesh",
  },
  {
    id: "emerald-ronin",
    name: "Emerald Ronin",
    creator: "@emberart",
    floorPrice: 1.12,
    items: 888,
    verified: false,
    accent: "#2FBFA6",
    pattern: "radial",
  },
];

export const nftItems: NftItem[] = [
  {
    id: "wolf-142",
    name: "Obsidian Wolf #142",
    collection: "Obsidian Wolves",
    price: 1.92,
    category: "PFP",
    rarity: "Legendary",
    accent: "#1FAE72",
    pattern: "radial",
  },
  {
    id: "serpent-087",
    name: "Golden Serpent #087",
    collection: "Golden Serpents",
    price: 0.97,
    category: "Art",
    rarity: "Epic",
    accent: "#C6A15B",
    pattern: "diagonal",
  },
  {
    id: "aurora-019",
    name: "Aurora Dream #019",
    collection: "Aurora Dreams",
    price: 2.6,
    category: "Art",
    rarity: "Rare",
    accent: "#7C5CFF",
    pattern: "aurora",
  },
  {
    id: "void-256",
    name: "Void Walker #256",
    collection: "Void Walkers",
    price: 0.61,
    category: "Gaming",
    accent: "#3FE39A",
    pattern: "mesh",
  },
  {
    id: "ronin-033",
    name: "Emerald Ronin #033",
    collection: "Emerald Ronin",
    price: 1.2,
    category: "PFP",
    rarity: "Epic",
    accent: "#2FBFA6",
    pattern: "radial",
  },
  {
    id: "wolf-201",
    name: "Obsidian Wolf #201",
    collection: "Obsidian Wolves",
    price: 1.78,
    category: "PFP",
    accent: "#E4CE9B",
    pattern: "diagonal",
  },
  {
    id: "beat-011",
    name: "Kryvora Beats #011",
    collection: "Kryvora Beats",
    price: 0.34,
    category: "Music",
    accent: "#C6A15B",
    pattern: "mesh",
  },
  {
    id: "frame-005",
    name: "Golden Hour #005",
    collection: "Field Notes",
    price: 0.45,
    category: "Photography",
    rarity: "Rare",
    accent: "#1FAE72",
    pattern: "aurora",
  },
];
