const ACCENT_PALETTE = ["#1FAE72", "#C6A15B", "#3FE39A", "#8FA6C9", "#E4CE9B", "#6FD1B0"];

function accentFromAddress(address: string): string {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
  }
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length];
}

// Avatar bulat untuk token on-chain sembarang (native ETH maupun ERC20 apapun),
// dengan gradasi warna yang konsisten per alamat kontrak — tanpa perlu daftar warna mock.
export function TokenAvatar({
  symbol,
  address,
  size = 34,
}: {
  symbol: string;
  address: string;
  size?: number;
}) {
  const accent = accentFromAddress(address);
  const initials = symbol.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase() || "?";

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-gold/40 font-display text-[11px] text-ivory"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${accent}66, #0B241A 60%, #07090A 100%)`,
      }}
    >
      {initials}
    </div>
  );
}
