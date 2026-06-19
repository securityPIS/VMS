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
Data dummy untuk menjalankan UI tanpa backend; menjadi **seed store di memori**
yang dikelola `api.js` saat MODE MOCK. **Jangan dipakai di produksi.**
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

## `api.js` ✅ (lapisan data tunggal)
Satu-satunya tempat memanggil Apps Script. Komponen **tidak** memanggil `fetch`
langsung — selalu lewat `api.*`. Dua mode transparan ke pemanggil:
- **Backend** (`VITE_APPS_SCRIPT_URL` terisi): `post(action, payload)` POST
  `text/plain` (hindari CORS preflight), parse JSON, lempar bila `data.error`.
  Respons read dipetakan lewat `adapters.js`.
- **Mock** (`USE_MOCK`, URL kosong): membaca/menulis **store di memori** (salinan
  `mockData`) — read mengembalikan data, mutation benar-benar mengubah store
  (mis. cek kartu duplikat) lalu container memuat ulang. Tidak melempar.
- `getPhoto(ref)` — resolusi foto: URL langsung (mock) atau base64 via
  `doGet?action=getPhoto` (backend, di-cache). Dipakai `RemotePhoto`.
- Method memetakan tiap endpoint PRD §9 + `getVisitStatus`. Aksi security
  menerima `actorEmail`/`location` (dikirim sebagai `actor_email` untuk NFR-08).
- `getRole(email)` **mock-aware** (lokal via `resolveRoleFromEmail` saat mock).

## `adapters.js` ✅
Pure functions yang menormalkan respons backend ke bentuk komponen:
- `splitDateTime(value)` → `{ date: 'YYYY-MM-DD', time: 'HH:mm' }`.
- `adaptVisit(row)` → `{ id, name, asal, cardNumber, selfiePhoto, rejectReason,
  date, time, timeOut, … }` (snake_case → camelCase, datetime dipisah).
- `adaptPackage(row)` → `{ id, sender, recipient, photo, date, time, … }`.
