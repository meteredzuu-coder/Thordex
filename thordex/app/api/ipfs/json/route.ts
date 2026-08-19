import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "https://gateway.pinata.cloud/ipfs";

export async function POST(request: Request) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: "PINATA_JWT belum diatur di server. Tambahkan env var PINATA_JWT di Vercel." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }

  try {
    const res = await fetch(PINATA_JSON_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pinataContent: body }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.details || data?.error || "Upload metadata ke Pinata gagal." },
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
      { error: err instanceof Error ? err.message : "Upload metadata ke Pinata gagal." },
      { status: 500 }
    );
  }
}
