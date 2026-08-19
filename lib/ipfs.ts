export type IpfsUploadResult = {
  cid: string;
  uri: string; // ipfs://<cid>
  gatewayUrl: string; // https://gateway.pinata.cloud/ipfs/<cid>
};

async function parseUploadResponse(res: Response): Promise<IpfsUploadResult> {
  if (!res.ok) {
    let message = `Upload ke IPFS gagal (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore, pakai pesan default
    }
    throw new Error(message);
  }
  return res.json();
}

/** Upload file gambar (token image / banner) ke IPFS lewat /api/ipfs/file. */
export async function uploadFileToIPFS(file: File): Promise<IpfsUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/ipfs/file", {
    method: "POST",
    body: formData,
  });
  return parseUploadResponse(res);
}

/** Upload objek metadata JSON token ke IPFS lewat /api/ipfs/json. */
export async function uploadJSONToIPFS(json: Record<string, unknown>): Promise<IpfsUploadResult> {
  const res = await fetch("/api/ipfs/json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
  return parseUploadResponse(res);
}
