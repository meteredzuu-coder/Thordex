export const KRYVORA_NETWORK = {
  chainIdHex: "0x4668b2c",
  chainIdDecimal: 73829164,
  chainName: "Kryvora Network",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-testnet.kryvora.network"],
  blockExplorerUrls: ["https://explorer-testnet.kryvora.network"],
} as const;

export const KRYVORA_FAUCET_URL = "https://faucet-testnet.kryvora.network";

/**
 * Meminta wallet (mis. MetaMask) untuk pindah ke Kryvora Network.
 * Jika jaringan belum dikenal oleh wallet, otomatis coba menambahkannya.
 */
export async function ensureKryvoraNetwork(provider: any) {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: KRYVORA_NETWORK.chainIdHex }],
    });
  } catch (switchError: any) {
    // 4902 = chain belum ditambahkan ke wallet
    if (switchError?.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: KRYVORA_NETWORK.chainIdHex,
            chainName: KRYVORA_NETWORK.chainName,
            nativeCurrency: KRYVORA_NETWORK.nativeCurrency,
            rpcUrls: KRYVORA_NETWORK.rpcUrls,
            blockExplorerUrls: KRYVORA_NETWORK.blockExplorerUrls,
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}
