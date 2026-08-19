import {
  AMM_FACTORY_ADDRESS,
  AMM_FACTORY_ABI,
  PAIR_ABI,
  ERC20_MIN_ABI,
  WKRY_ADDRESS,
  KRYVORA_NETWORK,
} from "./contracts";

export type LiveToken = {
  address: string; // selalu lowercase
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean; // true kalau token ini adalah WKRY (direpresentasikan sebagai ETH native)
};

export type LivePool = {
  id: string; // alamat pair, dipakai sebagai key React
  pairAddress: string;
  tokenA: LiveToken;
  tokenB: LiveToken;
  reserveA: bigint;
  reserveB: bigint;
  // Nilai pool dalam ETH — hanya bisa dihitung kalau salah satu sisi pool adalah ETH/WKRY
  // (tanpa oracle harga, pool token-token murni tidak bisa dikonversi ke satuan tunggal).
  tvlEth: number | null;
  myLpBalance: bigint;
  totalSupply: bigint;
  myAmountA: number;
  myAmountB: number;
  myShareEth: number | null;
};

const tokenCache = new Map<string, LiveToken>();

async function resolveToken(address: string, provider: any): Promise<LiveToken> {
  const key = address.toLowerCase();
  const cached = tokenCache.get(key);
  if (cached) return cached;

  const { Contract } = await import("ethers");
  const isNative = key === WKRY_ADDRESS.toLowerCase();

  let symbol = "???";
  let name = "Token";
  let decimals = 18;
  try {
    const token = new Contract(address, ERC20_MIN_ABI, provider);
    const [s, n, d] = await Promise.all([token.symbol(), token.name(), token.decimals()]);
    symbol = isNative ? KRYVORA_NETWORK.nativeCurrency.symbol : s;
    name = isNative ? KRYVORA_NETWORK.nativeCurrency.name : n;
    decimals = Number(d);
  } catch {
    // biarkan nilai default kalau metadata token gagal dibaca
  }

  const info: LiveToken = { address: key, symbol, name, decimals, isNative };
  tokenCache.set(key, info);
  return info;
}

/**
 * Ambil semua pool likuiditas asli yang pernah dibuat di ThorDexAMMFactory (Kryvora Network),
 * lengkap dengan reserve, dan — kalau userAddress diisi — posisi LP milik user di tiap pool.
 */
export async function fetchLivePools(userAddress?: string | null): Promise<LivePool[]> {
  const { JsonRpcProvider, Contract, formatUnits } = await import("ethers");
  const provider = new JsonRpcProvider(KRYVORA_NETWORK.rpcUrls[0]);
  const factory = new Contract(AMM_FACTORY_ADDRESS, AMM_FACTORY_ABI, provider);

  const length: bigint = await factory.allPairsLength();
  const count = Number(length);
  if (count === 0) return [];

  const pairAddresses: string[] = await Promise.all(
    Array.from({ length: count }, (_, i) => factory.allPairs(i))
  );

  const results = await Promise.all(
    pairAddresses.map(async (pairAddress): Promise<LivePool | null> => {
      try {
        const pair = new Contract(pairAddress, PAIR_ABI, provider);
        const [token0Addr, token1Addr, reserves, totalSupply, myLpBalance]: [
          string,
          string,
          [bigint, bigint],
          bigint,
          bigint
        ] = await Promise.all([
          pair.token0(),
          pair.token1(),
          pair.getReserves(),
          pair.totalSupply(),
          userAddress ? pair.balanceOf(userAddress) : Promise.resolve(BigInt(0)),
        ]);

        const [tokenA, tokenB] = await Promise.all([
          resolveToken(token0Addr, provider),
          resolveToken(token1Addr, provider),
        ]);

        const reserveA = reserves[0];
        const reserveB = reserves[1];

        const tvlEth = tokenA.isNative
          ? Number(formatUnits(reserveA, tokenA.decimals)) * 2
          : tokenB.isNative
          ? Number(formatUnits(reserveB, tokenB.decimals)) * 2
          : null;

        const myAmountA =
          totalSupply > BigInt(0)
            ? Number(formatUnits((reserveA * myLpBalance) / totalSupply, tokenA.decimals))
            : 0;
        const myAmountB =
          totalSupply > BigInt(0)
            ? Number(formatUnits((reserveB * myLpBalance) / totalSupply, tokenB.decimals))
            : 0;
        const myShareEth = tokenA.isNative ? myAmountA * 2 : tokenB.isNative ? myAmountB * 2 : null;

        return {
          id: pairAddress.toLowerCase(),
          pairAddress,
          tokenA,
          tokenB,
          reserveA,
          reserveB,
          tvlEth,
          myLpBalance,
          totalSupply,
          myAmountA,
          myAmountB,
          myShareEth,
        };
      } catch {
        // lewati pool yang gagal dibaca (mis. RPC sempat error) daripada gagal total
        return null;
      }
    })
  );

  return results.filter((p): p is LivePool => p !== null);
}

export function totalTvlEth(pools: LivePool[]): number {
  return pools.reduce((sum, p) => sum + (p.tvlEth ?? 0), 0);
}

export function totalMyShareEth(pools: LivePool[]): number {
  return pools.reduce((sum, p) => sum + (p.myShareEth ?? 0), 0);
}
