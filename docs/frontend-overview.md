# Frontend Overview (`web/`)

Aplikasi React (Vite) untuk VMS. Di-scaffold dari prototype monolith `index.txt`
menjadi modul-modul kecil (≤500 baris/file) agar mudah dirawat & di-debug.

## Stack
- **React 18** + **Vite 5** (build cepat, HMR).
- **Tailwind CSS 3** + `tailwindcss-animate` (utility styling + animasi `animate-in`).
- **recharts** (grafik dashboard admin), **lucide-react** (ikon).

## Struktur folder
```
web/
├── index.html, vite/tailwind/postcss config, package.json, .env.example
└── src/
    ├── main.jsx          # entry
    ├── App.jsx           # routing berbasis peran
    ├── index.css         # tailwind + base
    ├── lib/              # constants, mockData, api (seam backend)
    ├── components/       # primitives: BrandLogo, Button, InputField, Badge, ModalBase
    ├── screens/          # Login, VisitorForm, VisitorStatus
    └── features/
        ├── security/     # dashboard petugas (sidebar, 4 tab, 4 modal)
        └── admin/        # dashboard admin (sidebar, 3 tab, 1 modal)
```

## Alur peran (App.jsx)
1. **Belum login** → `LoginScreen`.
2. **Visitor** → `VisitorFormScreen` → setelah submit → `VisitorStatusScreen`.
3. **Security** → `SecurityDashboard`.
4. **Admin** → `AdminDashboard`.

## Mode Mock vs Backend
Komponen **selalu** memanggil `api.*` (lib/api.js) — satu jalur data, dua mode:
- **MODE BACKEND** (`VITE_APPS_SCRIPT_URL` terisi): `api.*` POST ke Apps Script;
  respons dinormalisasi ke bentuk frontend via `lib/adapters.js`. Foto privat
  dimuat lewat `api.getPhoto` (komponen `RemotePhoto`).
- **MODE MOCK** (URL kosong, otomatis): `api.*` membaca/menulis **store di memori**
  (salinan `mockData.js`) sehingga semua alur (check-in, registrasi paket, submit
  kunjungan, dll.) tetap berfungsi tanpa backend. Perubahan hilang saat refresh.

Container (`SecurityDashboard`, `AdminDashboard`) memuat data via `api.*` saat
mount, memanggil `api.*` untuk tiap aksi lalu **memuat ulang**, dengan state
loading & error. Untuk menyambung backend cukup isi `web/.env`
(`VITE_APPS_SCRIPT_URL`, `VITE_GOOGLE_CLIENT_ID`) tanpa ubah komponen.

## Hal yang masih simulasi / sisa go-live
| Area | Status | Catatan |
|---|---|---|
| Data (kunjungan, paket, petugas, statistik) | ✅ wired | Lewat `api.*` (mock atau Apps Script). |
| Foto KTP/Selfie/Paket | ✅ wired | `PhotoCapture` (kamera+kompres) → `api.uploadPhoto`; tampil via `RemotePhoto`. |
| Status tamu | ✅ wired | Polling `api.getVisitStatus` tiap 5 dtk sampai status final. |
| Validasi kartu duplikat (FR-10) | ✅ wired | Ditegakkan backend `checkIn` (& store mock). |
| Login Google | 🟡 | Alur `getRole` jalan; butuh `VITE_GOOGLE_CLIENT_ID` agar tombol Google nyata (panel demo dipakai saat mock). |
| Enforcement lokasi petugas (NFR-08) | ✅ | Backend menegakkan role/lokasi dari Google ID token yang diverifikasi server-side. |

## Menjalankan
```bash
cd web && npm install && npm run dev
```
