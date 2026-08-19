import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PINATA_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "https://gateway.pinata.cloud/ipfs";

export async function POST(request: Request) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: "PINATA_JWT belum diatur di server. Tambahkan env var PINATA_JWT di Vercel." },
      { status: 500 }
    );
  }

  const incoming = await request.formData();
  const file = incoming.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "File tidak ditemukan pada request." }, { status: 400 });
  }

  const forward = new FormData();
  forward.append("file", file, (file as File).name || "upload");

  try {
    const res = await fetch(PINATA_FILE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: forward,
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.details || data?.error || "Upload ke Pinata gagal." },
        { status: res.status }
      );
    }

    const cid: string = data.IpfsHash;
    return NextResponse.json({
      cid,
      uri: `ipfs://${cid}`,
      gatewayUrl: `${PINATA_GATEWAY}/${cid}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload ke Pinata gagal." },
      { status: 500 }
    );
  }
}
