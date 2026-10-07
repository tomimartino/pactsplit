# Penyiapan PactSplit tanpa layanan berbayar

## Yang sudah disiapkan

Kode aplikasi, kontrak, tes, demo, dan konfigurasi Vercel ada di repositori ini. Gunakan paket Vercel **Hobby**, subdomain bawaan, dompet browser yang sudah dimiliki, dan faucet testnet gratis. Tidak perlu kartu kredit, Supabase, domain berbayar, atau API berbayar untuk MVP.

## 1. Uji di Arc testnet

1. Buka halaman `/setup` pada website PactSplit.
2. Hubungkan dompet browser milik Anda. Tambahkan atau pilih **Arc Testnet**, chain ID **5042002**, RPC `https://rpc.testnet.arc.io`, simbol **USDC**.
3. Ambil test USDC dari [faucet resmi Circle](https://faucet.circle.com). Pilih jaringan Arc Testnet. Test USDC tidak memiliki nilai nyata.
4. Tekan **Deploy on Arc Testnet** dan tinjau transaksi di dompet. Anda yang menandatangani transaksi. Jangan bagikan seed phrase atau private key.
5. Sesudah berhasil, halaman menampilkan tiga nilai publik: chain ID, alamat kontrak, dan deployment block.
6. Masukkan nilai tersebut ke Environment Variables proyek **pactsplit** di Vercel untuk Production dan Preview. Redeploy karena nilai publik dibundel ketika aplikasi dibangun.
7. Verifikasi source kontrak di explorer testnet. Gunakan Solidity **0.8.28**, optimizer **200 runs**, EVM target **cancun**, tanpa constructor arguments. Jalankan `node scripts/export-verification.mjs` setelah compile untuk menyiapkan `work/verification-standard-input.json`. Nama kontrak lengkap: `project/contracts/PactSplit.sol:PactSplit`.
8. Buat invoice 10 test USDC dengan tiga alamat penerima berbeda. Buka link pada browser atau perangkat kedua dan bayar dari dompet klien. Pastikan penerima mendapat 6/3/1 dan receipt berstatus sukses.

## 2. Hosting gratis

Proyek Vercel: **pactsplit**, ruang akun **tomimartinoaffandis-projects**, paket **Hobby**. Jangan aktifkan Pro trial, paid add-on, domain berbayar, atau elastic build machine.

Konfigurasi framework Next.js, perintah build, dan install ada di `vercel.json`. File `.env.local`, `.vercel`, log, dan node_modules tidak termasuk source publik. Deployment awal tanpa alamat kontrak menampilkan demo dan draft, serta keterangan bahwa transaksi belum tersedia.

Untuk deployment dari terminal setelah login dan memastikan target proyek:

```sh
npx vercel project inspect --scope tomimartinoaffandis-projects --non-interactive
npx vercel deploy --prod --scope tomimartinoaffandis-projects --archive=tgz --yes
```

Vercel Hobby ditujukan untuk penggunaan pribadi/nonkomersial dan memiliki batas pemakaian. Gunakan untuk prototipe hackathon pribadi ini; evaluasi paket lagi jika meluncurkan layanan komersial.

## 3. Arc mainnet sebelum submission

Mainnet membutuhkan USDC nyata untuk biaya jaringan. Publikasi invoice dan pembayaran klien adalah transaksi terpisah. **Tidak ada janji biaya mainnet nol.**

1. Konfirmasi Arc mainnet RPC dan explorer dapat diakses. Jaringan: chain ID **5042**, RPC `https://rpc.mainnet.arc.io`, explorer `https://explorer.arc.io`.
2. Ubah `NEXT_PUBLIC_PACTSPLIT_CHAIN_ID` menjadi `5042` dan kosongkan alamat testnet. Redeploy agar `/setup` menampilkan jaringan yang benar.
3. Dari dompet Anda, deploy kontrak pada mainnet melalui `/setup`. Periksa biaya di dompet sebelum menyetujui.
4. Konfigurasikan alamat dan block mainnet yang benar; redeploy. Verifikasi source kontrak di explorer.
5. Buat dan bayar invoice kecil dari dua dompet milik tim. Simpan link deployment, invoice, receipt, dan bukti penerima sesuai pembagian.
6. Jangan mencampur alamat testnet dengan mainnet. Link lama testnet hanya berfungsi pada website testnet; jika tetap ingin mempertahankannya, gunakan deployment/subdomain testnet tersendiri.

## 4. GitHub dan submission

Publikasikan source sebagai repositori GitHub publik, tanpa `.env.local`, `.vercel`, credential, atau file build. README sudah mencantumkan batasan dan cara menjalankan proyek. Lengkapi `HACKATHON.md` dengan tautan yang benar-benar tersedia, profil builder, dan transaksi mainnet sebelum mengirim ke DoraHacks.

## Bila transaksi terasa macet

Halaman menyimpan hash transaksi yang sudah dikirim. Tekan **Check confirmation** atau buka explorer. Jangan langsung membayar atau menerbitkan ulang. Jika transaksi gagal, invoice tetap terbuka; biaya jaringan mungkin tetap dibebankan. Jika satu penerima menolak transfer, seluruh pembagian batal.
