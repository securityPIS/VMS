# Modul `src/lib/`

Lapisan non-UI: konstanta, data mock, dan integrasi backend.

## `constants.js`
Konstanta terpusat agar tidak ada "magic value" tersebar.
- `LOCATIONS` — daftar lokasi/gate (nanti dari `api.getLocations`).
- `PACKAGE_TYPES` — pilihan jenis barang pada registrasi paket.
- `VISIT_STATUS` — map status kunjungan → `{ color, icon, label }` (dipakai `Badge`).
- `PACKAGE_STATUS` — map status paket → `{ color, icon, label }`.
- `timeID(date)` — format jam `HH:mm` lokal Indonesia.

## `mockData.js` 🟡 (dev only)
Data dummy untuk menjalankan UI tanpa backend. **Jangan dipakai di produksi.**
- `MOCK_VISITS` — kunjungan contoh (punya `location`, foto, status).
- `MOCK_PACKAGES` — paket contoh.
- `MOCK_SECURITY_OFFICERS` — petugas contoh (id, nama, email, lokasi, status).
  Ini sekaligus **direktori email security** yang dipakai resolusi peran.
- `MOCK_ADMINS`, `MOCK_RETURNING_VISITORS` — email admin & email tamu lama (mock).
- `DEV_LOGIN_PRESETS` — pintasan login tiap peran untuk panel demo.
- `resolveRoleFromEmail(email)` — versi mock dari backend `getRole`: urutan
  admin → petugas **Active** → tamu lama → tamu baru. Mengembalikan objek user
  (`{ role, type?, name, email, location?, asal? }`).
- `CHART_WEEKLY`, `CHART_DEPT`, `PIE_COLORS` — data grafik dashboard admin.

## `googleAuth.js` 🟡 (auth)
Login satu tombol via **Google Identity Services**.
- `signInWithGoogle()` — muat skrip GIS, tampilkan dialog Google, kembalikan
  **email terverifikasi** dari ID token. Peran ditentukan terpisah (`api.getRole`).
- `GOOGLE_CONFIGURED` — `true` bila `VITE_GOOGLE_CLIENT_ID` terisi.
- ⚠️ Butuh OAuth Client ID (Google Cloud Console). Bila kosong → throw error jelas;
  di mode mock, `LoginScreen` melewati GIS dan pakai email demo.

## `api.js` 🟡 (seam backend)
Satu-satunya tempat memanggil Apps Script. Komponen **tidak** memanggil `fetch`
langsung — selalu lewat `api.*`.
- Membaca `VITE_APPS_SCRIPT_URL` & `VITE_API_SECRET` dari env.
- `USE_MOCK` true bila URL kosong → `post()` melempar error informatif.
- `post(action, payload)` — POST `text/plain` (hindari CORS preflight Apps Script),
  parse JSON, lempar bila `data.error`.
- Objek `api` memetakan tiap endpoint PRD §9 (getVisitorByEmail, submitVisit,
  uploadPhoto, getPendingVisits, checkIn, rejectVisit, checkOut, addPackage,
  getPackages, pickupPackage, getDashboardStats, getVisitorTimeline, getOfficers,
  addOfficer, updateOfficer, getLocations, getRole, getHistory).
- `getRole(email)` **mock-aware**: di mode mock diselesaikan lokal via
  `resolveRoleFromEmail`; di produksi memanggil endpoint `getRole`.

**TODO Fase C:** arahkan container memanggil `api.*`, tambah loading/error,
dan (opsional) mode mock yang mengembalikan `mockData` agar dev tetap jalan.
