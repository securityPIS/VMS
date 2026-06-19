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
- Saat ini **MODE MOCK**: data dari `src/lib/mockData.js`, state dikelola lokal di
  tiap container (`SecurityDashboard`, `AdminDashboard`). Aksi (check-in, dll.)
  hanya mengubah state di memori (hilang saat refresh).
- **Menyambung backend** (Fase C): isi `web/.env` (`VITE_APPS_SCRIPT_URL`,
  `VITE_API_SECRET`) lalu ganti pemanggilan state lokal dengan `api.*` di
  `src/lib/api.js`. Tambahkan loading & error state.

## Hal yang masih simulasi (perlu diganti saat go-live)
| Area | Sekarang | Target |
|---|---|---|
| Login | Tombol pilih peran | Google OAuth + `getRole` |
| Foto KTP/Selfie/Paket | Set boolean | Kamera (`capture="user"`) + kompres + upload Drive |
| Data | Mock lokal | Fetch dari Apps Script |
| Status tamu | Statis | Polling/auto-refresh |
| Validasi kartu | Tidak ada | Cek duplikat kartu aktif (FR-10) |

## Menjalankan
```bash
cd web && npm install && npm run dev
```
