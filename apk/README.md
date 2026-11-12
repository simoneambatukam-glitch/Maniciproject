# Kasir POS MANICI — Aplikasi Android (APK)

Aplikasi kasir buat toko MANICI (temennya Vicky). Dibangun dari file web
`index.html` di repo ini (root) memakai Capacitor, jadi bisa di-install
sebagai aplikasi Android dan cetak struk langsung ke printer Bluetooth
tanpa aplikasi tambahan.

## Cara build APK

APK di-build otomatis oleh GitHub Actions setiap ada perubahan di folder
`apk/` (lihat `.github/workflows/bulid-apk.yml` di repo ini).

1. Buka tab **Actions** di repo GitHub ini.
2. Pilih workflow **Build APK Kasir POS**.
3. Kalau belum jalan otomatis, tap **Run workflow**.
4. Tunggu sampai selesai (sekitar 5-10 menit).
5. Unduh file APK dari bagian **Artifacts** (nama: `kasir-pos-debug`).
6. Install APK di HP Android (izinkan "install dari sumber tidak dikenal"
   kalau diminta).

## Cetak struk (printer iware)

- Di aplikasi, buka **Setting → Printer Bluetooth → Pilih Printer**,
  lalu ketuk nama printer iware. Sekali pilih, aplikasi mengingatnya.
- Pas **Bayar & cetak**, struk langsung dikirim ke printer lewat
  Bluetooth biasa (SPP) — tanpa RawBT, tanpa aplikasi tambahan.
- Pastikan printer iware sudah di-pair di Bluetooth HP dan dalam
  keadaan nyala.

## File penting

- `www/index.html` — aplikasi kasir (sama dengan `index.html` di root repo).
- `capacitor.config.json` — id aplikasi `com.manici.kasir`, nama `Kasir POS`.
- `android/` — project Android (Capacitor + plugin Bluetooth Serial).
- `.github/scripts/generate-icons.py` — bikin ikon launcher + splash
  (hijau-emas MANICI) saat build, jadi tidak perlu file gambar di repo.
  Script ini ada di repo, jadi workflow bisa menjalankannya langsung.
