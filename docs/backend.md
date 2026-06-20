# Backend — Google Apps Script (`backend/`)

Web App Apps Script + Google Spreadsheet (DB) + Google Drive (foto). Semua file
`.js` di-deploy sebagai satu proyek Apps Script (berbagi scope global — tanpa
`import`). Tiap file satu concern, ≤500 baris.

## Alur request
```
React (Vercel) ──POST text/plain {action, secret, ...}──► doPost (Code.js)
                                                            │ verifySecret (auth.js)
                                                            ▼ dispatch(action)
                              handler domain ──► sheets.js ──► Spreadsheet / Drive
```
- **text/plain** dipakai agar tidak memicu CORS preflight.
- Respons = JSON value langsung (objek/array). Error → `{ "error": "..." }`.

## Daftar file
| File | Isi |
|---|---|
| `Code.js` | `doPost` (router + verifySecret), `doGet` (health + getPhoto), `dispatch`, `jsonOutput`. |
| `config.js` | Konstanta: nama sheet, `HEADERS` (urutan kolom), status, peran, retensi, kunci properti. |
| `sheets.js` | Helper Spreadsheet: `readRows`, `appendRow`, `updateCells`, `stripRow`, `uuid`, `shortId`. |
| `auth.js` | `verifySecret` (NFR-05), `getRole`, `assertSecurityAt` (NFR-08), helper email/role. |
| `visitors.js` | `getVisitorByEmail`, `submitVisit` (buat Visitor + Visit PENDING). |
| `visits.js` | `getPendingVisits`, `getActiveVisits`, `checkIn`, `rejectVisit`, `checkOut`, `getHistory`, `getVisitStatus`; `checkIn` menyimpan `confirm_notes` dan mengirim email konfirmasi; `enrichVisits` (join `asal`+`ktp_photo_url` dari Visitors). |
| `packages.js` | `addPackage`, `getPackages`, `pickupPackage`. |
| `officers.js` | `getLocations`, `getOfficers`, `addOfficer`, `updateOfficer`, `deleteOfficer` (whitelist security; lokasi divalidasi ke sheet `Locations`). |
| `analytics.js` | `getDashboardStats` (metrik + weekly/dept), `getVisitorTimeline`. |
| `drive.js` | `uploadPhoto` (folder privat), `servePhoto` (getPhoto ber-secret). |
| `email.js` | `sendConfirmEmail` dan `sendRejectEmail` (MailApp). |
| `retention.js` | `purgeOldData` + `installRetentionTrigger` (hapus >30 hari, NFR-07). |
| `setup.js` | `setupSpreadsheet()` — inisialisasi sekali (sheet, seed, secret, folder). |
| `appsscript.json` | Manifest: timezone, runtime V8, webapp (Anyone), oauthScopes. |

## Keamanan & kepatuhan
- **NFR-05:** setiap POST wajib `secret` yang cocok dengan `API_SECRET` (Script Properties).
- **NFR-08:** filter lokasi di backend (`filterVisits`/`getPackages`). `assertSecurityAt`
  meng-enforce lokasi bila `actor_email` dikirim — **TODO go-live:** wajibkan identitas
  petugas terverifikasi (token), saat ini opsional agar kompatibel fase mock.
- **UU PDP / NFR-04:** foto di folder Drive **privat** (tanpa link publik); diakses lewat
  `getPhoto` ber-secret. **NFR-07:** `purgeOldData` hapus data & foto >30 hari (trigger harian).

## Kontrak endpoint (ringkas)
Request: `{ action, secret, ...payload }`. Berikut payload & hasil utama:

| Action | Payload | Hasil |
|---|---|---|
| `getRole` | `email` | `{ role, name, email, type?, location_id?, location?, officer_id?, asal? }` |
| `getVisitorByEmail` | `email` | `{ visitor }` (atau `null`) |
| `uploadPhoto` | `base64, type, email, mime?` | `{ id, url }` |
| `submitVisit` | `email, name?, ktp?, asal?, tujuan, keperluan, location, ktp_photo_url?, selfie_url?` | `{ visit_id, status }` |
| `getLocations` | — | `[{ location_id, name }]` |
| `getPendingVisits` / `getActiveVisits` | `location` | `[visit…]` |
| `checkIn` | `visit_id, card_number, confirm_notes` | `{ visit_id, status }` (+ email konfirmasi tamu) |
| `rejectVisit` | `visit_id, reason` | `{ visit_id, status }` (+ email tamu) |
| `checkOut` | `visit_id` | `{ visit_id, status }` |
| `getVisitStatus` | `visit_id` | `{ status, reject_reason, tujuan, nama }` (polling layar tamu) |
| `addPackage` | `sender, recipient, type?, photo_url?, location` | `{ package_id, status }` |
| `getPackages` | `status?, location?` | `[package…]` |
| `pickupPackage` | `package_id` | `{ package_id, status }` |
| `getHistory` | `location?, from?, to?` | `[visit…]` |
| `getDashboardStats` | — | `{ totalMonth, doneToday, rejected, activeNow, weekly[], dept[] }` |
| `getVisitorTimeline` | `search?` | `[{ email, nama, visits[] }]` |
| `getOfficers` | — | `[{ officer_id, name, email, location_id, location, status }]` |
| `addOfficer` | `name, email, location_id` | `{ officer_id }` |
| `updateOfficer` | `officer_id, name?, email?, status?, location_id?` | `{ officer_id }` |
| `deleteOfficer` | `officer_id` | `{ officer_id }` |

> Catatan: aksi security menerima `actor_email` opsional untuk enforcement NFR-08.

## Deploy (clasp)
```bash
cd backend
clasp create --type webapp --title "VMS Backend"   # buat proyek + .clasp.json
clasp push                                          # unggah semua .js + manifest
clasp deploy --description "v1"                      # buat URL Web App (/exec)
```
Lalu di **editor Apps Script** (`clasp open-script`):
1. Jalankan `setupSpreadsheet()` sekali → otorisasi scope → catat `api_secret` dari log.
2. Jalankan `installRetentionTrigger()` sekali → pasang trigger retensi harian.
3. Pastikan deployment Web App: *Execute as = Me*, *Who has access = Anyone*.

### Deployment aktif (akun alkaboyz88@gmail.com)
| Item | Nilai |
|---|---|
| Script ID | `19vtR6uvsHh1pdtfL7EI417M2zrl35_Ot5iI2xn4Wfqcm2JuORH6_Jjjq` |
| Editor | https://script.google.com/d/19vtR6uvsHh1pdtfL7EI417M2zrl35_Ot5iI2xn4Wfqcm2JuORH6_Jjjq/edit |
| Deployment | `AKfycbznOb448TO5XEzujESIcb33XTeDfcNf4kTAIrRNsEZ9fmaCKy5uvM-dK1ybU-V8pmln` |
| URL `/exec` | https://script.google.com/macros/s/AKfycbznOb448TO5XEzujESIcb33XTeDfcNf4kTAIrRNsEZ9fmaCKy5uvM-dK1ybU-V8pmln/exec |

> Status: kode ter-push & ter-deploy. Endpoint masih "Akses Ditolak" sampai pemilik
> menjalankan `setupSpreadsheet()` (otorisasi scope) di editor. Setelah `clasp push`
> berikutnya, jalankan `clasp redeploy <deploymentId>` agar URL yang sama ikut terbarui.

## Wiring ke frontend
Isi `web/.env`:
```
VITE_APPS_SCRIPT_URL=<URL /exec dari clasp deploy>
VITE_API_SECRET=<api_secret dari setupSpreadsheet()>
```
URL terisi → `USE_MOCK=false` → frontend memanggil backend nyata (lihat `web/src/lib/api.js`).
