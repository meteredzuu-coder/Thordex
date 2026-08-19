import { KRYVORA_NETWORK } from "./network";

// Alamat kontrak di Kryvora Testnet (lihat README thordexsmartcontract).
// Bisa dioverride lewat env var kalau suatu saat di-deploy ulang / pindah jaringan.
export const TOKEN_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS ?? "0x178e606Cb1f67Ee8fcFCfD0182BE3E56493043d5";

export const TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "0x8C070B765c0637A6Af9Fb1F7A3DD39c32d688c7d";

export const AMM_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_AMM_FACTORY_ADDRESS ?? "0x3F6902cC81810B65E2a52f48F04E44167A9C301F";

export const WKRY_ADDRESS =
  process.env.NEXT_PUBLIC_WKRY_ADDRESS ?? "0x510b39d03dE1DEB8cf91D67c6AFE46b44661F74D";

export const ROUTER_ADDRESS =
  process.env.NEXT_PUBLIC_ROUTER_ADDRESS ?? "0xa4cC2d619496272f8a118aC2feF2b7820a315963";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export { KRYVORA_NETWORK };

// ABI minimal ThorDexTokenFactory — hanya yang dipakai frontend (create + baca fee).
export const TOKEN_FACTORY_ABI = [
  "function creationFee() view returns (uint256)",
  "function createToken(string name_, string symbol_, uint256 totalSupplyTokens_, string metadataURI_) payable returns (address token)",
  "function getTokensByCreator(address creator_) view returns (address[])",
  "event TokenCreated(address indexed token, address indexed creator, string name, string symbol, uint256 totalSupply, string metadataURI)",
] as const;

// ABI minimal ThorDexAMMFactory — dipakai untuk cek apakah sebuah token sudah punya pool (pair) vs WKRY.
export const AMM_FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)",
] as const;

// ABI minimal ThorDexPair — dipakai untuk baca reserve (jumlah liquidity) sebuah pool.
export const PAIR_ABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint256 reserve0, uint256 reserve1)",
] as const;

// ABI ERC20 minimal — dipakai untuk baca name/symbol token yang sudah dideploy user,
// plus decimals/balanceOf/allowance/approve yang dibutuhkan alur Tambah Likuiditas.
export const ERC20_MIN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
] as const;

// ABI minimal ThorDexRouter — dipakai untuk Tambah Likuiditas on-chain.
export const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)",
  "function addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity)",
] as const;

export function explorerTxUrl(hash: string) {
  return `${KRYVORA_NETWORK.blockExplorerUrls[0]}/tx/${hash}`;
}

export function explorerAddressUrl(address: string) {
  return `${KRYVORA_NETWORK.blockExplorerUrls[0]}/address/${address}`;
}
