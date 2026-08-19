import { KRYVORA_NETWORK } from "./network";

// Alamat kontrak di Kryvora Testnet (lihat README thordexsmartcontract).
// Bisa dioverride lewat env var kalau suatu saat di-deploy ulang / pindah jaringan.
export const TOKEN_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS ?? "0x178e606Cb1f67Ee8fcFCfD0182BE3E56493043d5";

export const TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "0x8C070B765c0637A6Af9Fb1F7A3DD39c32d688c7d";

export { KRYVORA_NETWORK };

// ABI minimal ThorDexTokenFactory — hanya yang dipakai frontend (create + baca fee).
export const TOKEN_FACTORY_ABI = [
  "function creationFee() view returns (uint256)",
  "function createToken(string name_, string symbol_, uint256 totalSupplyTokens_, string metadataURI_) payable returns (address token)",
  "function getTokensByCreator(address creator_) view returns (address[])",
  "event TokenCreated(address indexed token, address indexed creator, string name, string symbol, uint256 totalSupply, string metadataURI)",
] as const;

export function explorerTxUrl(hash: string) {
  return `${KRYVORA_NETWORK.blockExplorerUrls[0]}/tx/${hash}`;
}

export function explorerAddressUrl(address: string) {
  return `${KRYVORA_NETWORK.blockExplorerUrls[0]}/address/${address}`;
}
