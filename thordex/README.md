# Thordex — Frontend

Desain frontend halaman **Home** untuk Thordex. Dibangun dengan Next.js (App Router) +
TypeScript + Tailwind CSS. Belum tersambung ke backend/API apa pun — semua data koin
di `lib/coins.ts` masih data contoh (mock), sesuai rencana: desain UI dulu, backend menyusul.

## Tema

Hitam (obsidian) dipadu hijau jade dan aksen emas untuk kesan mewah, dengan tipografi
serif `Fraunces` untuk judul, `Manrope` untuk teks UI, dan `JetBrains Mono` untuk angka
harga/persentase.

## Struktur halaman Home

- Header: tombol hamburger (buka menu samping) + tombol search bulat (cari koin)
- Logo medali + nama brand
- Top Coin Info: kartu koin unggulan
- Pengumuman: slot banner (placeholder, sesuai bagian "kosong" pada wireframe)
- Daftar Koin: list koin, tiap baris bisa diklik
- Bottom navigation: Home, Create Coin, NFT, Wallet, Liquidity, Swap

Menu **Create Coin**, **NFT**, **Wallet**, **Liquidity**, dan **Swap** sudah punya halaman sendiri.
Menu **Dexscreener** dan klik pada baris koin di Home masih menampilkan popup **"Segera Hadir"**
karena belum dibangun.

## Struktur halaman Swap

- Kartu "Anda Bayar" dan "Anda Terima" dengan pemilih token (bottom sheet pencarian token)
- Tombol balik arah swap, kalkulasi rate & jumlah diterima otomatis dari harga mock di `lib/pools.ts`
- Info rate, biaya swap, slippage tolerance (pilihan 0.1% / 0.5% / 1%), dan minimum diterima
- Tombol Connect Wallet bila belum terhubung; aksi Swap masih memicu popup "Segera Hadir"

## Struktur halaman Liquidity

- Ringkasan statistik: Total TVL, jumlah pool, dan total posisi milik user (data mock)
- Tab "Semua Pool" / "Posisi Saya", daftar pool dengan TVL & APR (data mock di `lib/pools.ts`)
- Ketuk pool atau tombol "+" untuk membuka bottom sheet **Tambah Likuiditas** (dua input token
  dengan rasio otomatis, estimasi pangsa pool); aksi submit masih memicu popup "Segera Hadir"

## Menjalankan di lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Upload ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: Thordex home page"
git branch -M main
git remote add origin <URL_REPO_GITHUB_ANDA>
git push -u origin main
```

## Deploy ke Vercel

1. Buka https://vercel.com dan login/daftar.
2. Klik **Add New → Project**, pilih repo GitHub Thordex yang baru di-push.
3. Vercel otomatis mendeteksi Next.js — biarkan pengaturan default, klik **Deploy**.
4. Setelah selesai, situs bisa diakses lewat URL `*.vercel.app` yang diberikan.

## Halaman Create — sudah tersambung on-chain

Halaman **Create** sekarang sudah berfungsi penuh: submit form → upload gambar & metadata ke
IPFS (via Pinata) → panggil `ThorDexTokenFactory.createToken(...)` di Kryvora Network → tampilkan
popup sukses berisi alamat kontrak & hash transaksi (bisa disalin) plus tombol **Add Your Liquidity**.

Field **Add social links** sekarang **Optional**, dan blok **Buy tokens at launch** sudah dihapus.
Ditambahkan juga field **Initial Token Supply** (wajib diisi, dengan tombol cepat 1M/10M/100M/1B) —
ini yang dikirim sebagai `totalSupplyTokens_` ke factory.

### Environment variable yang wajib diisi di Vercel

| Variabel | Wajib? | Keterangan |
|---|---|---|
| `PINATA_JWT` | Ya | JWT dari akun Pinata (pinata.cloud), dipakai server-side lewat `/api/ipfs/*` — jangan pakai prefix `NEXT_PUBLIC_` supaya tidak bocor ke browser. |
| `NEXT_PUBLIC_PINATA_GATEWAY` | Opsional | Default `https://gateway.pinata.cloud/ipfs`. Isi kalau punya dedicated gateway sendiri. |
| `NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS` | Opsional | Default sudah diisi alamat `ThorDexTokenFactory` dari README kontrak. Override kalau deploy ulang. |
| `NEXT_PUBLIC_TREASURY_ADDRESS` | Opsional | Default sudah diisi alamat `ThorDexTreasury`. |

Tanpa `PINATA_JWT`, tombol Create Token akan menampilkan pesan error saat upload gambar.

## Langkah selanjutnya

- Ganti data mock di `lib/coins.ts` dan `lib/pools.ts` (harga token, saldo, TVL pool, APR)
  dengan data on-chain/API asli.
- Sambungkan aksi **Swap** (di `SwapView.tsx`) dan **Tambah Likuiditas** (di
  `AddLiquiditySheet.tsx`) ke smart contract AMM asli — saat ini keduanya masih memicu
  popup "Segera Hadir" sebagai placeholder.
- Bangun halaman **Dexscreener** — lalu hapus pemicunya di `components/BottomNav.tsx`.
