# Backend - Google Apps Script (`backend/`)

Web App Apps Script + Google Spreadsheet (DB) + Google Drive (foto). Semua file
`.js` di-deploy sebagai satu proyek Apps Script dan berbagi scope global.

## Alur Request

```text
React (Vercel) --POST text/plain {action, id_token, ...}--> doPost (Code.js)
                                                              | verifyIdToken (identity.js)
                                                              | enforceRateLimit (ratelimit.js)
                                                              v
                                                     dispatch(action, authedEmail)
                                                              |
                                                     handler domain -> Sheets/Drive/Mail
```

- `id_token` adalah Google ID token dari GIS dan diverifikasi server-side.
- Backend menurunkan identitas dari token, bukan dari email di payload.
- Respons = JSON value langsung. Error client dibuat aman: pesan publik + `error_code`
  dan `error_id`; detail teknis tetap hanya dicatat ke log Apps Script.

## Daftar File

| File | Isi |
|---|---|
| `Code.js` | `doPost` (verify ID token, rate-limit, dispatch), error mapping aman, `doGet` health, `jsonOutput`. |
| `identity.js` | Verifikasi Google ID token via tokeninfo + cache `CacheService`. |
| `ratelimit.js` | Rate-limit best-effort per action/email. |
| `validation.js` | Sanitasi input, validasi email/KTP, masking KTP, helper lock. |
| `config.js` | Konstanta sheet, header, status, peran, retensi, kunci property. |
| `sheets.js` | Helper Spreadsheet: `readRows`, `appendRow`, `updateCells`, `stripRow`, id. |
| `auth.js` | `getRole`, `requireAdmin`, `requireSecurityScope`, akses visit/foto. |
| `visitors.js` | `getVisitorByEmail`, `submitVisit`; email owner dari token. |
| `visits.js` | Antrean, aktif, status, check-in/reject/check-out, history; semua RBAC server-side. |
| `packages.js` | Paket masuk/ambil dengan scope lokasi. |
| `officers.js` | Lokasi aktif dan CRUD petugas khusus admin. |
| `analytics.js` | Dashboard stats dan visitor timeline khusus admin. |
| `drive.js` | Upload foto tervalidasi dan `getPhoto` POST ber-token + ownership check. |
| `email.js` | Email konfirmasi/penolakan plain text dengan input tersanitasi. |
| `retention.js` | `purgeOldData` + `installRetentionTrigger` untuk retensi 30 hari. |
| `setup.js` | Inisialisasi sheet/seed/folder dan status konfigurasi. |
| `appsscript.json` | Manifest V8, webapp Anyone, scope Drive/Sheets/Mail/UrlFetch. |

## Security Model

- Semua POST data wajib membawa `id_token` Google valid.
- `GOOGLE_CLIENT_ID` wajib di Script Properties.
- Endpoint admin memakai `requireAdmin(authedEmail)`.
- Endpoint security memakai `requireSecurityScope(authedEmail, location)`.
- Visitor hanya boleh melihat/mengubah data miliknya.
- `getPhoto` tidak lagi lewat query string; foto hanya keluar bila ID terkait row yang boleh diakses.
- `checkIn`, `rejectVisit`, `checkOut`, package pickup, dan CRUD petugas memakai `LockService`.
- KTP penuh tidak dikirim ke frontend; gunakan `ktp_masked` bila perlu ditampilkan.

## Health & Error Login

`GET /exec` mengembalikan health aman untuk operasional:

```json
{
  "ok": true,
  "service": "VMS Apps Script",
  "backend_ready": true,
  "google_client_id_configured": true,
  "spreadsheet_configured": true,
  "photo_folder_configured": true,
  "url_fetch_authorized": true
}
```

Saat login gagal, frontend menerima pesan publik dan kode seperti:

- `BACKEND_OAUTH_CONFIG_MISSING` - `GOOGLE_CLIENT_ID` belum di Script Properties.
- `BACKEND_GOOGLE_VERIFY_NOT_AUTHORIZED` - Apps Script belum authorized untuk
  memanggil `UrlFetchApp` ke Google tokeninfo.
- `OAUTH_CLIENT_MISMATCH` - OAuth client frontend tidak sama dengan backend.
- `BACKEND_DATA_NOT_READY` - properti/sheet database belum siap.
- `OFFICER_ASSIGNMENT_INVALID` - assignment lokasi petugas kosong/tidak aktif,
  atau data Users lama perlu diselaraskan dengan master Locations.
- `ACCOUNT_INACTIVE` - akun petugas dinonaktifkan admin.

Jangan mengembalikan stack trace atau isi Script Properties ke frontend.

## Kontrak Endpoint Ringkas

Request: `{ action, id_token, ...payload }`.

| Action | Otorisasi |
|---|---|
| `getRole` | Token valid |
| `getLocations` | Token valid |
| `getVisitorByEmail` | Owner email atau admin |
| `uploadPhoto` | Token valid; MIME/ukuran valid |
| `submitVisit` | Owner dari token; consent wajib |
| `getPhoto` | Owner/security lokasi/admin sesuai row foto |
| `getVisitStatus` | Owner visit atau security/admin berwenang |
| `getPendingVisits`, `getActiveVisits`, `getHistory` | Security lokasi sendiri atau admin |
| `checkIn`, `rejectVisit`, `checkOut` | Security lokasi row atau admin |
| `addPackage`, `getPackages`, `pickupPackage` | Security lokasi row atau admin |
| `getDashboardStats`, `getVisitorTimeline` | Admin |
| `getOfficers`, `addOfficer`, `updateOfficer`, `deleteOfficer` | Admin |

## Deploy (clasp)

```bash
cd backend
clasp push
clasp deploy --description "security hardening"
```

Setelah deploy, pastikan Script Properties berisi:

```text
SPREADSHEET_ID=<id spreadsheet>
PHOTO_FOLDER_ID=<id folder foto>
GOOGLE_CLIENT_ID=<OAuth Web Client ID yang sama dengan VITE_GOOGLE_CLIENT_ID>
```

Secret lama tidak lagi menjadi kontrol akses aplikasi.

Jika health `GET /exec` menunjukkan `url_fetch_authorized: false`, buka Apps
Script editor lalu jalankan fungsi `authorizeRuntimeScopes()` sekali dengan akun
deployer. Google akan menampilkan dialog consent untuk scope runtime. Setelah
consent selesai, health harus berubah menjadi `backend_ready: true`.

## Wiring Frontend

Isi `web/.env`:

```text
VITE_APPS_SCRIPT_URL=<URL /exec Apps Script>
VITE_GOOGLE_CLIENT_ID=<OAuth Web Client ID>
```

Jangan menaruh kredensial backend di frontend.
