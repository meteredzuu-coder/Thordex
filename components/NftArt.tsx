import type { ArtPattern } from "@/lib/nfts";

function backgroundFor(accent: string, pattern: ArtPattern) {
  switch (pattern) {
    case "diagonal":
      return `linear-gradient(135deg, ${accent}77 0%, #123324 55%, #07090A 100%)`;
    case "mesh":
      return `radial-gradient(circle at 20% 20%, ${accent}66 0%, transparent 45%), radial-gradient(circle at 85% 75%, #C6A15B55 0%, transparent 50%), #0B241A`;
    case "aurora":
      return `linear-gradient(160deg, ${accent}55 0%, #0B241A 45%, #07090A 100%)`;
    case "radial":
    default:
      return `radial-gradient(circle at 30% 25%, ${accent}77 0%, #123324 55%, #07090A 100%)`;
  }
}

/**
 * Placeholder art tile for NFT thumbnails/covers — a generative-looking
 * gradient with a faint grid overlay, standing in for real artwork.
 */
export function NftArt({
  accent,
  pattern = "radial",
  className = "",
}: {
  accent: string;
  pattern?: ArtPattern;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: backgroundFor(accent, pattern) }}
    >
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(237,242,237,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(237,242,237,0.4) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      />
    </div>
  );
}
