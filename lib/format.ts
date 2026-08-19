export function formatPrice(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  });
}

export function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// Format jumlah token/ETH on-chain asli (bukan estimasi USD) — dipakai di halaman Liquidity
// karena TVL & posisi pool dihitung langsung dari reserve on-chain, tanpa oracle harga.
export function formatToken(value: number): string {
  if (!value) return "0";
  const maxDecimals = value < 1 ? 6 : value < 1000 ? 4 : 2;
  return value.toLocaleString("en-US", { maximumFractionDigits: maxDecimals });
}
