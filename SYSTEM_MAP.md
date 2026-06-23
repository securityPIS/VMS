# SYSTEM_MAP — Visitor Management System (VMS)

Master index seluruh file proyek. Setiap file punya deskripsi satu baris di sini.
Dokumentasi lebih dalam per-modul ada di folder [`docs/`](docs/).

> Tujuan: memudahkan maintenance & debugging. Setiap menambah/mengubah file,
> perbarui juga barisnya di tabel ini (dan doc modulnya bila ada).

**Status:** ✅ selesai · 🟡 mock/sebagian · ⏳ belum dibuat

---

## 1. Arsitektur singkat

```
Browser (React/Vite, di Vercel)
        │  HTTPS JSON (action + id_token)
        ▼
Google Apps Script Web App  ──►  Google Spreadsheet (DB)
        │                         Google Drive (foto)
        └──► MailApp (email confirm/reject)
```

- **`web/`** — frontend React. **Tersambung backend** lewat `lib/api.js`: bila
  `VITE_APPS_SCRIPT_URL` terisi → memanggil Apps Script nyata; bila kosong →
  **MODE MOCK** otomatis (store di memori) agar dev/demo tetap jalan.
- **`backend/`** — Google Apps Script + skema Spreadsheet; health endpoint
  menampilkan readiness aman untuk OAuth, Spreadsheet, dan folder foto.
- **Dokumen** — PRD, UI/UX, dan `docs/` ada di root.

---

## 2. Root proyek (`C:/dev/VMS/`)

| File | Status | Deskripsi |
|---|:--:|---|
| `PRD_Visitor_Management_System.md` | ✅ | Product Requirements (v1.3) — sumber kebutuhan & scope v1. |
| `UIUX_Design_Requirements_VMS.md` | ✅ | Spesifikasi desain & layar (v1.1). |
| `index.txt` | ✅ | Prototype monolith asli (referensi historis; sudah dipecah ke `web/src`). |
| `SYSTEM_MAP.md` | ✅ | Dokumen ini — index seluruh file. |
| `docs/` | ✅ | Dokumentasi per-modul (lihat §6). |
| `web/` | ✅ | Aplikasi frontend React — tersambung backend via `api.*` (lihat §3–§5). |
| `backend/` | ✅ | Apps Script + skema Spreadsheet, error mapping aman, dan workflow deploy GAS (lihat §6). |

---

## 3. Frontend — konfigurasi (`web/`)

| File | Status | Deskripsi |
|---|:--:|---|
| `web/package.json` | ✅ | Dependency & script (`dev`, `build`, `preview`). React 18, Vite 5, Tailwind 3, recharts, lucide. |
| `web/vite.config.js` | ✅ | Konfigurasi Vite + plugin React. |
| `web/tailwind.config.js` | ✅ | Tailwind + token warna Pertamina + plugin animasi. |
| `web/postcss.config.js` | ✅ | PostCSS (tailwindcss + autoprefixer). |
| `web/index.html` | ✅ | HTML root + font Inter + mount `#root`. |
| `web/.env.example` | ✅ | Contoh env (URL Apps Script dan OAuth client ID). |
| `web/.gitignore` | ✅ | Abaikan `node_modules`, `dist`, `.env`, dll. |

## 4. Frontend — inti & shared (`web/src/`)

| File | Status | Deskripsi |
|---|:--:|---|
| `src/main.jsx` | ✅ | Entry point — render `<App/>` ke DOM. |
| `src/App.jsx` | ✅ | Routing berbasis peran (visitor/security/admin) & state kunjungan. |
| `src/index.css` | ✅ | Direktif Tailwind + base (font, input 16px anti auto-zoom iOS). |
| `src/lib/constants.js` | ✅ | Lokasi, jenis paket, konfigurasi badge status, helper waktu. |
| `src/lib/mockData.js` | 🟡 | Data dummy (visits, packages, officers, chart) + direktori peran & `resolveRoleFromEmail`. Dev only (jadi seed store mock di `api.js`). |
| `src/lib/api.js` | ✅ | Lapisan data tunggal: mode backend (Apps Script + adapters) atau MODE MOCK; error backend membawa `error_code`/`error_id`. |
| `src/lib/adapters.js` | ✅ | Normalisasi respons backend (snake_case, datetime) → bentuk frontend (camelCase, date/time terpisah). |
| `src/lib/googleAuth.js` | 🟡 | Login Google (GIS) — render tombol resmi Google dan kembalikan ID token + email terverifikasi. Butuh `VITE_GOOGLE_CLIENT_ID`. |
| `src/components/BrandLogo.jsx` | ✅ | Logo Pertamina + wordmark VMS (signature resmi). |
| `src/components/Button.jsx` | ✅ | Tombol (6 varian: filled/tonal/outlined/text/danger/success). |
| `src/components/InputField.jsx` | ✅ | Input teks berlabel. |
| `src/components/Badge.jsx` | ✅ | Pill status kunjungan (warna+ikon+teks). |
| `src/components/ModalBase.jsx` | ✅ | Kerangka modal (overlay, judul, body, footer). |
| `src/components/RemotePhoto.jsx` | ✅ | Tampilkan foto dari ref: URL langsung (mock) atau id Drive privat (backend, via `getPhoto`). |
| `src/components/PhotoCapture.jsx` | ✅ | Ambil foto kamera + kompres JPEG (data URL) untuk diunggah `api.uploadPhoto`. |

## 5. Frontend — layar & fitur

### Screens (`src/screens/`)
| File | Status | Deskripsi |
|---|:--:|---|
| `LoginScreen.jsx` | 🟡 | Satu tombol "Masuk dengan Google"; peran dari ID token (`getRole`). Panel demo saat mock; menampilkan kode error login aman. |
| `VisitorFormScreen.jsx` | ✅ | Form tamu baru/lama: pilih lokasi, foto KTP/selfie (kamera+kompres), submit ke `api.submitVisit`. |
| `VisitorStatusScreen.jsx` | ✅ | Status kunjungan tamu (PENDING/CHECKED_IN/CHECKED_OUT/REJECTED) + polling `getVisitStatus`. |

### Fitur Security (`src/features/security/`)
| File | Status | Deskripsi |
|---|:--:|---|
| `SecurityDashboard.jsx` | ✅ | Container: muat data via `api.*` (pending/aktif/riwayat/paket), aksi + refetch, loading/error. |
| `SecuritySidebar.jsx` | ✅ | Navigasi (antrean/aktif/paket/riwayat) + badge jumlah pending. |
| `QueueTab.jsx` | ✅ | Kartu antrean PENDING + Izinkan Masuk/Tolak. |
| `ActiveVisitsTab.jsx` | ✅ | Tabel tamu CHECKED_IN + Check-out. |
| `PackagesTab.jsx` | ✅ | Tabel paket + registrasi + tandai diambil. |
| `HistoryTab.jsx` | ✅ | Tabel riwayat kunjungan + badge status. |
| `CheckInModal.jsx` | ✅ | Input nomor kartu visitor (wajib). |
| `RejectModal.jsx` | ✅ | Alasan penolakan (wajib). |
| `CheckoutModal.jsx` | ✅ | Konfirmasi check-out + pengingat tukar kartu↔KTP. |
| `AddPackageModal.jsx` | ✅ | Form registrasi paket masuk. |

### Fitur Admin (`src/features/admin/`)
| File | Status | Deskripsi |
|---|:--:|---|
| `AdminDashboard.jsx` | ✅ | Container: muat petugas & riwayat via `api.*`, aksi + refetch, loading/error. |
| `AdminSidebar.jsx` | ✅ | Navigasi gelap (dashboard/assignment/jejak visitor). |
| `DashboardOverviewTab.jsx` | ✅ | Kartu metrik + grafik tren (bar) & distribusi (pie) dari `api.getDashboardStats`. |
| `OfficerAssignmentTab.jsx` | ✅ | Kartu petugas + menu titik tiga untuk edit/delete + aktif/nonaktif + lokasi. |
| `AddOfficerModal.jsx` | ✅ | Form tambah/edit petugas (nama/email/lokasi dari master `Locations`). |
| `DeleteOfficerModal.jsx` | ✅ | Konfirmasi hapus petugas dari whitelist security. |
| `VisitorTimelineTab.jsx` | ✅ | Pencarian + kartu visitor expandable jadi timeline. |

---

## 6. Backend — Google Apps Script (`backend/`)

Kode ✅ ditulis (modular, ≤500 baris/file) dan siap deploy via `clasp` ke
deployment Web App yang sama. Lihat [docs/backend.md](docs/backend.md).

| File | Status | Deskripsi |
|---|:--:|---|
| `backend/Code.js` | ✅ | Router `doPost` (verifyIdToken + rate-limit + dispatch), error mapping aman, & `doGet` health. |
| `backend/config.js` | ✅ | Konstanta: nama sheet, `HEADERS`, status, peran, retensi, kunci properti. |
| `backend/sheets.js` | ✅ | Helper Spreadsheet (readRows/appendRow/updateCells/stripRow/id). |
| `backend/auth.js` | ✅ | `getRole`, `requireAdmin`, `requireSecurityScope`, dan helper RBAC/lokasi. |
| `backend/visitors.js` | ✅ | `getVisitorByEmail`, `submitVisit`. |
| `backend/visits.js` | ✅ | Antrean, `checkIn` + catatan konfirmasi/email, `rejectVisit`, `checkOut`, `getHistory`, `getVisitStatus`; `enrichVisits` (join asal/foto KTP). |
| `backend/packages.js` | ✅ | `addPackage`, `getPackages`, `pickupPackage`. |
| `backend/officers.js` | ✅ | `getLocations`, `getOfficers`, `addOfficer`, `updateOfficer`, `deleteOfficer` + validasi lokasi aktif. |
| `backend/analytics.js` | ✅ | `getDashboardStats`, `getVisitorTimeline`. |
| `backend/drive.js` | ✅ | `uploadPhoto` tervalidasi + `getPhoto` POST ber-token dan ownership check. |
| `backend/email.js` | ✅ | `sendConfirmEmail` dan `sendRejectEmail` (MailApp). |
| `backend/retention.js` | ✅ | `purgeOldData` + `installRetentionTrigger` (NFR-07, >30 hari). |
| `backend/setup.js` | ✅ | `setupSpreadsheet()` — inisialisasi sheet, seed admin/lokasi, dan folder foto. |
| `backend/appsscript.json` | ✅ | Manifest (V8, webapp Anyone, oauthScopes). |
| Spreadsheet | 🟡 | Sheet: `Visitors`, `Visits`, `Packages`, `Users`, `Locations` — dibuat/dirapikan oleh `setupSpreadsheet()`. |

---

## 7. Cara menjalankan (frontend)

```bash
cd web
npm install        # sekali saja
npm run dev        # http://localhost:5173 (mode mock)
npm run build      # build produksi → web/dist
```

Untuk menyambung backend: salin `web/.env.example` → `web/.env`, isi `VITE_APPS_SCRIPT_URL` dan `VITE_GOOGLE_CLIENT_ID`.

---

## 8. Index dokumentasi (`docs/`)

| Dokumen | Isi |
|---|---|
| [docs/frontend-overview.md](docs/frontend-overview.md) | Arsitektur frontend, struktur folder, alur data, mock vs backend. |
| [docs/lib.md](docs/lib.md) | Rincian `constants.js`, `mockData.js`, `api.js`. |
| [docs/components.md](docs/components.md) | Rincian komponen shared. |
| [docs/screens.md](docs/screens.md) | Rincian layar login & visitor. |
| [docs/feature-security.md](docs/feature-security.md) | Rincian modul security. |
| [docs/feature-admin.md](docs/feature-admin.md) | Rincian modul admin. |
| [docs/backend.md](docs/backend.md) | Backend Apps Script: file, endpoint, keamanan, deploy. |
