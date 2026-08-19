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

Menu selain **Home** (baik di bottom nav maupun menu samping) dan klik pada baris koin
akan menampilkan popup **"Segera Hadir"** — karena halaman-halaman tersebut belum dibangun.

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

## Langkah selanjutnya

- Ganti data mock di `lib/coins.ts` dengan data on-chain/API asli.
- Bangun halaman untuk Create Coin, NFT, Wallet, Liquidity, dan Swap — lalu hapus
  pemicu popup "Segera Hadir" untuk masing-masing di `components/BottomNav.tsx` dan
  `components/Drawer.tsx`, arahkan ke route barunya.
